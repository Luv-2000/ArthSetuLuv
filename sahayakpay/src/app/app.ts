import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  template: `
    <div *ngIf="currentPage() === 'home'" class="homepage-container">
      <h1 class="welcome-title">Welcome to <span class="brand">SahayakPay</span></h1>
      <div class="button-group">
        <button class="action-btn" aria-label="Send Money" (click)="currentPage.set('send-money')"><span class="btn-icon" aria-hidden="true">💸</span> Send Money</button>
        <button class="action-btn" aria-label="Check Balance" (click)="currentPage.set('check-balance')"><span class="btn-icon" aria-hidden="true">💰</span> Check Balance</button>
        <button class="action-btn" aria-label="Transactions"><span class="btn-icon" aria-hidden="true">📄</span> Transactions</button>
        <button class="action-btn" aria-label="Voice Assistant" (click)="currentPage.set('voice')"><span class="btn-icon" aria-hidden="true">🎤</span> Voice Assistant</button>
      </div>
    </div>
    <div *ngIf="currentPage() === 'voice'" class="voice-assistant-screen">
      <button class="back-btn" aria-label="Back to homepage" (click)="currentPage.set('home')">
        ← Back
      </button>
      <button class="mic-btn" aria-label="Start voice input" (click)="startListening()">
        <span class="mic-icon" [class.listening]="isListening()" aria-hidden="true">
          <svg width="144" height="144" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <rect width="144" height="144" rx="72" fill="currentColor" fill-opacity="0.08"/>
            <g>
              <rect x="54" y="30" width="36" height="60" rx="18" fill="currentColor"/>
              <rect x="66" y="96" width="12" height="18" rx="6" fill="currentColor"/>
              <rect x="48" y="114" width="48" height="12" rx="6" fill="currentColor"/>
            </g>
            <g opacity="0.2">
              <rect x="54" y="30" width="36" height="60" rx="18" fill="#000"/>
            </g>
          </svg>
        </span>
      </button>
      <div *ngIf="isListening()" class="status-text">Listening...</div>
      <div *ngIf="spokenText()" class="spoken-text">{{ spokenText() }}</div>
    </div>
    <div *ngIf="currentPage() === 'send-money'" class="send-money-screen">
      <button class="back-btn" aria-label="Back to homepage" (click)="currentPage.set('home')">
        ← Back
      </button>
      <h2 class="send-money-title">Send Money</h2>
      <div *ngIf="contactsLoading()" class="contacts-loading">Loading contacts...</div>
      <div *ngIf="!contactsLoading()" class="contacts-grid">
        <div *ngFor="let contact of contacts()" class="contact-card">
          <img [src]="contact.photo" [alt]="contact.name" class="contact-photo" />
          <div class="contact-name">{{ contact.name }}</div>
        </div>
      </div>
    </div>
    <div *ngIf="currentPage() === 'check-balance'" class="balance-screen">
      <button class="back-btn" aria-label="Back to homepage" (click)="currentPage.set('home')">
        ← Back
      </button>
      <h2 class="balance-title">Account Balance</h2>
      <div *ngIf="balanceLoading()" class="balance-loading">Loading balance...</div>
      <div *ngIf="!balanceLoading()" class="balance-amount">₹ {{ balance() | number:'1.0-0' }}</div>
    </div>
  `,
  styles: [`
    .homepage-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      background: #181c24;
      padding: 2rem 1rem;
    }
    .voice-assistant-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #181c24;
      color: #fff;
      font-size: 2rem;
      position: relative;
    }
    .welcome-title {
      font-size: 2.2rem;
      font-weight: bold;
      margin-bottom: 2.5rem;
      color: #fff;
      text-align: center;
      letter-spacing: 1px;
    }
    .brand {
      color: #00e6d0;
      font-weight: 900;
      letter-spacing: 2px;
    }
    .button-group {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      max-width: 400px;
    }
    .action-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1.5rem;
      font-weight: 700;
      padding: 1.5rem 2rem;
      border: none;
      border-radius: 1.2rem;
      color: #fff;
      box-shadow: 0 6px 0 0 #fff, 0 2px 16px rgba(0,0,0,0.18);
      transition: background 0.2s, transform 0.08s, box-shadow 0.08s;
      width: 100%;
      outline: 3px solid transparent;
      outline-offset: 2px;
      cursor: pointer;
      letter-spacing: 1px;
      margin: 0 auto;
      min-height: 64px;
      position: relative;
      will-change: transform;
    }
    .btn-icon {
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.5rem;
    }
    .action-btn:focus-visible {
      outline: 3px solid #fff200;
      filter: brightness(1.1);
    }
    .action-btn:active {
      filter: brightness(0.95);
      transform: translateY(6px) !important;
      box-shadow: 0 1px 0 0 #fff, 0 1px 4px rgba(0,0,0,0.12) !important;
    }
    .action-btn:nth-child(1) {
      background: #ff5722;
    }
    .action-btn:nth-child(2) {
      background: #00bfae;
    }
    .action-btn:nth-child(3) {
      background: #ffd600;
      color: #181c24;
    }
    .action-btn:nth-child(4) {
      background: #7c4dff;
    }
    .mic-btn {
      background: none;
      border: none;
      outline: none;
      cursor: pointer;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mic-icon {
      font-size: 9rem;
      color: #00e6d0;
      transition: color 0.2s, filter 0.2s;
      filter: drop-shadow(0 0 16px #00e6d0);
    }
    .mic-icon.listening {
      color: #ffd600;
      filter: drop-shadow(0 0 24px #ffd600);
    }
    .status-text {
      font-size: 1.2rem;
      color: #ffd600;
      margin-bottom: 1rem;
    }
    .spoken-text {
      font-size: 2.2rem;
      color: #fff;
      margin-top: 1.5rem;
      text-align: center;
      word-break: break-word;
      max-width: 90vw;
    }
    .back-btn {
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      z-index: 10;
      background: #222b3a;
      color: #fff;
      border: none;
      border-radius: 0.8rem;
      font-size: 1.4rem;
      font-weight: 700;
      padding: 0.8rem 1.6rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      transition: background 0.2s, color 0.2s;
      outline: 3px solid transparent;
      outline-offset: 2px;
    }
    .back-btn:focus-visible {
      outline: 3px solid #ffd600;
      background: #283593;
      color: #ffd600;
    }
    @media (max-width: 600px) {
      .welcome-title {
        font-size: 1.5rem;
      }
      .action-btn {
        font-size: 1.1rem;
        padding: 1.2rem 1rem;
        min-height: 56px;
      }
      .btn-icon {
        font-size: 1.4rem;
        margin-right: 0.4rem;
      }
    }
    .send-money-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      background: #181c24;
      color: #fff;
      padding: 2rem 1rem;
    }
    .send-money-title {
      font-size: 2.2rem;
      font-weight: bold;
      margin-bottom: 2.5rem;
      color: #00e6d0;
      text-align: center;
      letter-spacing: 1px;
    }
    .contacts-loading {
      color: #ffd600;
      font-size: 1.3rem;
      margin-top: 2rem;
    }
    .contacts-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      max-width: 400px;
      margin-top: 2rem;
    }
    .contact-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      background: #222b3a;
      border-radius: 1.2rem;
      padding: 1rem 1.2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      transition: transform 0.1s;
      gap: 1.2rem;
    }
    .contact-card:active {
      transform: translateY(4px) scale(0.98);
    }
    .contact-photo {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #00e6d0;
      background: #fff;
    }
    .contact-name {
      font-size: 2rem;
      color: #fff;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-align: left;
    }
    .balance-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      background: #181c24;
      color: #fff;
      padding: 2rem 1rem;
    }
    .balance-title {
      font-size: 2.2rem;
      font-weight: bold;
      margin-bottom: 2.5rem;
      color: #00e6d0;
      text-align: center;
      letter-spacing: 1px;
    }
    .balance-loading {
      color: #ffd600;
      font-size: 1.3rem;
      margin-top: 2rem;
    }
    .balance-amount {
      font-size: 3.2rem;
      color: #ffd600;
      font-weight: 900;
      margin-top: 2.5rem;
      letter-spacing: 2px;
      text-shadow: 0 2px 8px #222b3a;
    }
  `],
})
export class App {
  protected readonly title = signal('sahayakpay');
  currentPage = signal('home');
  isListening = signal(false);
  spokenText = signal('');
  contacts = signal<any[]>([]);
  contactsLoading = signal(false);
  balance = signal(0);
  balanceLoading = signal(false);

  constructor() {
    effect(() => {
      if (this.currentPage() === 'send-money') {
        this.fetchContacts();
      }
      if (this.currentPage() === 'check-balance') {
        this.fetchBalance();
      }
    });
  }

  fetchContacts() {
    this.contactsLoading.set(true);
    fetch('http://localhost:3001/api/contacts')
      .then(res => res.json())
      .then(data => {
        this.contacts.set(data);
        this.contactsLoading.set(false);
      })
      .catch(() => {
        this.contacts.set([]);
        this.contactsLoading.set(false);
      });
  }

  fetchBalance() {
    this.balanceLoading.set(true);
    fetch('http://localhost:3001/api/balance')
      .then(res => res.json())
      .then(data => {
        this.balance.set(data.balance);
        this.balanceLoading.set(false);
      })
      .catch(() => {
        this.balance.set(0);
        this.balanceLoading.set(false);
      });
  }

  startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    this.isListening.set(true);
    this.spokenText.set('');
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.spokenText.set(transcript);
      this.isListening.set(false);
    };
    recognition.onerror = (event: any) => {
      this.isListening.set(false);
      this.spokenText.set('');
      alert('Speech recognition error: ' + event.error);
    };
    recognition.onend = () => {
      this.isListening.set(false);
    };
    recognition.start();
  }
}
