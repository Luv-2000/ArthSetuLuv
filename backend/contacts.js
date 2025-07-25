const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
const app = express();
const PORT = 3001;
const fetch = require('node-fetch');

app.use(cors());
app.use(express.json());
app.use(express.json());
// Firestore setup
const serviceAccountPath = './serviceAccountKey.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Missing serviceAccountKey.json. Download it from Firebase Console and place it in backend/.');
  process.exit(1);
}
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});
const db = admin.firestore();
const contactsCollection = db.collection('contacts');
const balanceDoc = db.collection('accounts').doc('main');
const transactionsCollection = db.collection('transactions');

const sampleContacts = [
  { name: 'Amit Sharma', photo: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { name: 'Priya Singh', photo: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { name: 'Rahul Verma', photo: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { name: 'Sneha Patel', photo: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { name: 'Vikram Joshi', photo: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { name: 'Anjali Mehra', photo: 'https://randomuser.me/api/portraits/women/6.jpg' },
  { name: 'Rohit Gupta', photo: 'https://randomuser.me/api/portraits/men/7.jpg' },
  { name: 'Kavita Rao', photo: 'https://randomuser.me/api/portraits/women/8.jpg' },
  { name: 'Suresh Kumar', photo: 'https://randomuser.me/api/portraits/men/9.jpg' },
  { name: 'Neha Desai', photo: 'https://randomuser.me/api/portraits/women/10.jpg' }
];

app.get('/api/contacts', async (req, res) => {
  try {
    const snapshot = await contactsCollection.get();
    console.log('Firestore snapshot size:', snapshot.size);
    if (snapshot.empty) {
      // Seed Firestore if empty
      console.log('Seeding Firestore with sample contacts...');
      await Promise.all(sampleContacts.map(contact => contactsCollection.add(contact)));
      // Fetch again after seeding
      const seededSnapshot = await contactsCollection.get();
      const seededContacts = seededSnapshot.docs.map(doc => doc.data());
      return res.json(seededContacts);
    }
    const contacts = snapshot.docs.map(doc => doc.data());
    res.json(contacts);
  } catch (err) {
    console.error('Firestore error:', err);
    res.status(500).json({ error: 'Failed to fetch contacts', details: err.message });
  }
});

app.get('/api/balance', async (req, res) => {
  try {
    const doc = await balanceDoc.get();
    if (!doc.exists) {
      // Seed balance if not present
      await balanceDoc.set({ balance: 100000 });
      return res.json({ balance: 100000 });
    }
    res.json({ balance: doc.data().balance });
  } catch (err) {
    console.error('Firestore error (balance):', err);
    res.status(500).json({ error: 'Failed to fetch balance', details: err.message });
  }
});

app.post('/api/send-money', async (req, res) => {
  const { amount, name, photo } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  try {
    const doc = await balanceDoc.get();
    if (!doc.exists) {
      await balanceDoc.set({ balance: 100000 });
    }
    let currentBalance = doc.exists ? doc.data().balance : 100000;
    if (currentBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    const newBalance = currentBalance - amount;
    await balanceDoc.set({ balance: newBalance });
    // Generate a fake transaction id
    const transactionId = 'TXN' + Math.floor(Math.random() * 1e10).toString().padStart(10, '0');
    // Store transaction in Firestore
    await transactionsCollection.add({
      id: transactionId,
      name: name || '',
      photo: photo || '',
      amount,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, newBalance, transactionId });
  } catch (err) {
    console.error('Error in send-money:', err);
    res.status(500).json({ error: 'Failed to send money', details: err.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const snapshot = await transactionsCollection.orderBy('timestamp', 'desc').limit(10).get();
    const transactions = snapshot.docs.map(doc => doc.data());
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
  }
});

app.get('/api/voice-proxy', async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  const url = `https://arthasetu-ai-282482783617.europe-west1.run.app/api/v1/chat?prompt=${encodeURIComponent(prompt)}&user=vivek`;
  try {
    const response = await fetch(url);
    const data = await response.text();
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from external API', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Contacts API running on http://localhost:${PORT}`);
});

// Instructions:
// 1. Go to Firebase Console > Project Settings > Service Accounts.
// 2. Generate a new private key and download serviceAccountKey.json.
// 3. Place it in the backend/ directory. 