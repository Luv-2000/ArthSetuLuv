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
        <button class="action-btn" aria-label="Transactions" (click)="showTransactions()"><span class="btn-icon" aria-hidden="true">📄</span> Transactions</button>
        <button class="action-btn" aria-label="Voice Assistant" (click)="currentPage.set('voice')">
          <svg _ngcontent-ng-c922619693="" width="30" height="30" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect _ngcontent-ng-c922619693="" width="144" height="144" rx="72" fill="currentColor" fill-opacity="0.08"></rect><g _ngcontent-ng-c922619693=""><rect _ngcontent-ng-c922619693="" x="54" y="30" width="36" height="60" rx="18" fill="currentColor"></rect><rect _ngcontent-ng-c922619693="" x="66" y="96" width="12" height="18" rx="6" fill="currentColor"></rect><rect _ngcontent-ng-c922619693="" x="48" y="114" width="48" height="12" rx="6" fill="currentColor"></rect></g><g _ngcontent-ng-c922619693="" opacity="0.2"><rect _ngcontent-ng-c922619693="" x="54" y="30" width="36" height="60" rx="18" fill="#000"></rect></g></svg>
          Voice Assistant
        </button>
      </div>
    </div>
    <div *ngIf="currentPage() === 'voice'" class="voice-assistant-screen">
      <div class="lang-select-container" style="margin-bottom: 2.5rem; margin-top: 0.5rem;">
        <label for="lang-select" class="lang-label">Language:</label>
        <select id="lang-select" class="lang-select" [value]="selectedLang()" (change)="onLangChange($event)">
          <option *ngFor="let lang of langOptions" [value]="lang.value">{{ lang.label }}</option>
        </select>
      </div>
      <button class="back-btn" aria-label="Back to homepage" (click)="currentPage.set('home')">
        ← Back
      </button>
      <button class="mic-btn" aria-label="Start voice input" (click)="startListening()">
        <span class="mic-icon" [class.listening]="isListening()" aria-hidden="true">
          <svg width="220" height="220" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
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
      <div *ngIf="apiLoading()" class="api-loading">Getting response...</div>
      <div *ngIf="apiWords().length > 0 && !apiShowFull() && !apiLoading()" class="api-response">
        <span *ngFor="let word of apiWords(); let i = index">
          {{ word }}
          <ng-container *ngIf="i < apiWords().length - 1"> </ng-container>
        </span>
      </div>
      <div *ngIf="apiShowFull() && !apiLoading()" class="api-response">
        {{ apiResponse() }}
      </div>
      <div *ngIf="apiResponse() && !apiLoading() && speechUtterance">
        <button *ngIf="!speechPaused()" (click)="pauseSpeech()" class="pause-btn" aria-label="Pause voice response">⏸ Pause</button>
        <button *ngIf="speechPaused()" (click)="resumeSpeech()" class="play-btn" aria-label="Play voice response">▶️ Play</button>
      </div>
    </div>
    <div *ngIf="currentPage() === 'send-money'" class="send-money-screen">
      <button class="back-btn" aria-label="Back to homepage" (click)="currentPage.set('home')">
        ← Back
      </button>
      <h2 class="send-money-title" style="margin-top: 60px;">Send Money</h2>
      <div *ngIf="contactsLoading()" class="contacts-loading">Loading contacts...</div>
      <div *ngIf="!contactsLoading()" class="contacts-grid">
        <div *ngFor="let contact of contacts()" class="contact-card" (click)="onContactClick(contact)">
          <img [src]="contact.photo" [alt]="contact.name" class="contact-photo" />
          <div class="contact-name">{{ contact.name }}</div>
        </div>
      </div>
    </div>
    <div *ngIf="currentPage() === 'send-money-detail' && selectedContact()" class="send-money-detail-screen">
      <button class="back-btn" aria-label="Back to send money" (click)="currentPage.set('send-money')">
        ← Back
      </button>
      <h2 class="send-money-title" style="margin-top: 60px;">Send Money to</h2>
      <div class="contact-detail contact-detail-vertical">
        <img [src]="selectedContact().photo" [alt]="selectedContact().name" class="contact-photo-large" />
        <div class="contact-name-large">{{ selectedContact().name }}</div>
      </div>
      <div class="amount-input-container">
        <label for="amount-input" class="amount-label">Amount:</label>
        <input id="amount-input" class="amount-input" type="number" min="1" placeholder="Enter amount" [value]="amount()" (input)="onAmountInput($event)" />
      </div>
      <div class="quick-amount-btns">
        <button class="quick-btn" (click)="addAmount(10)">+10</button>
        <button class="quick-btn" (click)="addAmount(50)">+50</button>
        <button class="quick-btn" (click)="addAmount(100)">+100</button>
        <button class="quick-btn" (click)="addAmount(500)">+500</button>
      </div>
      <button class="send-btn" (click)="sendMoney()">Send</button>
    </div>
    <div *ngIf="currentPage() === 'enter-pin'" class="pin-entry-screen">
      <button class="back-btn" aria-label="Back to amount entry" (click)="currentPage.set('send-money-detail')">
        ← Back
      </button>
      <h2 class="pin-title">Enter PIN</h2>
      <div class="pin-input-container">
        <input id="pin-input" class="pin-input" type="password" maxlength="4" placeholder="Enter 4-digit PIN" [value]="pinInput()" (input)="pinInput.set($event.target.value)" />
      </div>
      <div *ngIf="pinError()" class="pin-error">{{ pinError() }}</div>
      <button class="send-btn" (click)="submitPin()">Submit</button>
    </div>
    <div *ngIf="currentPage() === 'check-balance'" class="balance-screen">
      <button class="back-btn" aria-label="Back to homepage" (click)="currentPage.set('home')">
        ← Back
      </button>
      <h2 class="balance-title">Account Balance</h2>
      <div *ngIf="balanceLoading()" class="balance-loading">Loading balance...</div>
      <div *ngIf="!balanceLoading()" class="balance-card">
        <div class="balance-icon">💰</div>
        <div class="balance-amount-highlight">₹ {{ balance() | number:'1.0-0' }}</div>
        <div class="balance-label">Available Balance</div>
      </div>
    </div>
    <div *ngIf="currentPage() === 'transaction-success' && transaction()" class="transaction-success-screen">
      <h2 class="success-title">Transaction Successful</h2>
      <div class="contact-detail contact-detail-vertical">
        <img [src]="transaction().photo" [alt]="transaction().name" class="contact-photo-large" />
        <div class="contact-name-large">{{ transaction().name }}</div>
      </div>
      <div class="success-details">
        <div class="success-amount">Amount Sent: ₹{{ transaction().amount }}</div>
        <div class="success-id">Transaction ID: {{ transaction().id }}</div>
      </div>
      <button class="back-btn" aria-label="Back to Home" (click)="goHome()">Back to Home</button>
    </div>
    <div *ngIf="currentPage() === 'transactions'" class="transactions-screen">
      <button class="back-btn" aria-label="Back to homepage" (click)="currentPage.set('home')">
        ← Back
      </button>
      <h2 class="transactions-title">Recent Transactions</h2>
      <div *ngIf="transactions().length === 0" class="no-transactions">No transactions found.</div>
      <div *ngFor="let txn of transactions()" class="transaction-card">
        <img [src]="txn.photo" [alt]="txn.name" class="transaction-photo" />
        <div class="transaction-info">
          <div class="transaction-name">{{ txn.name }}</div>
          <div class="transaction-amount">₹{{ txn.amount }}</div>
          <div class="transaction-id">ID: {{ txn.id }}</div>
          <div class="transaction-date">{{ getTxnDate(txn) | date:'short' }}</div>
        </div>
      </div>
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
      font-size: 13rem;
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
      gap: 2.5rem;
      width: 100%;
      max-width: 400px;
      margin-top: 2rem;
    }
    .contact-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      background: linear-gradient(135deg, #00bfae 0%, #283593 100%);
      border-radius: 1.6rem;
      padding: 1.5rem 2rem;
      box-shadow: 0 4px 24px 0 #00e6d0, 0 2px 16px rgba(0,0,0,0.18);
      transition: transform 0.1s, box-shadow 0.2s, outline 0.2s;
      gap: 2rem;
      outline: 3px solid transparent;
      outline-offset: 2px;
      cursor: pointer;
    }
    .contact-card:active, .contact-card:focus, .contact-card:focus-visible, .contact-card:hover {
      transform: scale(1.04);
      box-shadow: 0 0 0 4px #ffd600, 0 4px 24px 0 #00e6d0, 0 2px 16px rgba(0,0,0,0.18);
      outline: 3px solid #ffd600;
    }
    .contact-photo {
      width: 128px;
      height: 128px;
      border-radius: 50%;
      object-fit: cover;
      border: 5px solid #fff;
      background: #fff;
      box-shadow: none;
    }
    .contact-name {
      font-size: 2.6rem;
      color: #fff;
      font-weight: 900;
      letter-spacing: 1.2px;
      text-align: left;
      text-shadow: 0 2px 8px #00e6d0, 0 0 8px #222b3a;
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
    .balance-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, #00e6d0 0%, #7c4dff 100%);
      border-radius: 2rem;
      box-shadow: 0 8px 32px 0 rgba(0,0,0,0.25);
      padding: 2.5rem 2.5rem 2rem 2.5rem;
      margin-top: 2.5rem;
      min-width: 320px;
      max-width: 90vw;
      position: relative;
      overflow: hidden;
    }
    .balance-icon {
      font-size: 3.5rem;
      margin-bottom: 1.2rem;
      color: #fff200;
      filter: drop-shadow(0 0 12px #fff200);
      text-shadow: 0 2px 8px #222b3a;
    }
    .balance-amount-highlight {
      font-size: 3.2rem;
      color: #fff;
      font-weight: 900;
      letter-spacing: 2px;
      text-shadow: 0 2px 16px #222b3a, 0 0 32px #00e6d0;
      margin-bottom: 0.7rem;
    }
    .balance-label {
      font-size: 1.2rem;
      color: #fff;
      font-weight: 600;
      letter-spacing: 1px;
      opacity: 0.85;
    }
    .api-loading {
      color: #ffd600;
      font-size: 1.2rem;
      margin-top: 1.5rem;
    }
    .api-response {
      color: #00e6d0;
      font-size: 1.3rem;
      margin-top: 1.5rem;
      text-align: center;
      word-break: break-word;
      max-width: 90vw;
    }
    .lang-select-container {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      margin-bottom: 1.5rem;
      justify-content: center;
    }
    .lang-label {
      color: #fff;
      font-size: 1.5rem;
      font-weight: 700;
      margin-right: 1rem;
    }
    .lang-select {
      font-size: 1.5rem;
      padding: 0.8rem 2.2rem;
      border-radius: 1rem;
      border: 2px solid #00e6d0;
      background: #222b3a;
      color: #00e6d0;
      font-weight: 700;
      outline: none;
      transition: border 0.2s;
      min-width: 220px;
    }
    .lang-select:focus {
      border: 3px solid #ffd600;
    }
    .send-money-detail-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      background: #181c24;
      color: #fff;
      padding: 2rem 1rem;
    }
    .contact-detail {
      display: flex;
      flex-direction: row;
      align-items: center;
      background: #222b3a;
      border-radius: 1.2rem;
      padding: 1rem 1.2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      margin-bottom: 2rem;
      gap: 1.2rem;
    }
    .contact-detail .contact-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #00e6d0;
      background: #fff;
    }
    .contact-detail .contact-name {
      font-size: 2.5rem;
      color: #fff;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-align: left;
    }
    .amount-input-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      max-width: 400px;
    }
    .amount-label {
      font-size: 1.5rem;
      color: #fff;
      font-weight: 600;
      text-align: left;
    }
    .amount-input {
      font-size: 2rem;
      padding: 1rem 1.5rem;
      border-radius: 0.8rem;
      border: 1px solid #00e6d0;
      background: #222b3a;
      color: #fff;
      font-weight: 600;
      text-align: center;
      outline: none;
      transition: border 0.2s;
    }
    .amount-input:focus {
      border: 2px solid #ffd600;
    }
    .contact-detail-vertical {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #222b3a;
      border-radius: 1.2rem;
      padding: 2rem 1.2rem 1.5rem 1.2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      margin-bottom: 2rem;
      gap: 2rem;
    }
    .contact-photo-large {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #00e6d0;
      background: #fff;
    }
    .contact-name-large {
      font-size: 3.2rem;
      color: #fff;
      font-weight: 900;
      letter-spacing: 1px;
      text-align: center;
    }
    .quick-amount-btns {
      display: flex;
      gap: 1rem;
      margin: 2rem 0 1.5rem 0;
      justify-content: center;
    }
    .quick-btn {
      font-size: 1.5rem;
      padding: 0.7rem 1.5rem;
      border-radius: 0.7rem;
      border: none;
      background: #00e6d0;
      color: #181c24;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .quick-btn:active {
      background: #ffd600;
      color: #222b3a;
    }
    .send-btn {
      width: 100%;
      max-width: 400px;
      font-size: 2rem;
      padding: 1.2rem 0;
      border-radius: 0.9rem;
      border: none;
      background: #00e6d0;
      color: #181c24;
      font-weight: 900;
      margin-top: 2.5rem;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    }
    .send-btn:active {
      background: #ffd600;
      color: #222b3a;
    }
    .transaction-success-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      background: #181c24;
      color: #fff;
      padding: 2rem 1rem;
    }
    .success-title {
      font-size: 2.8rem;
      color: #00e6d0;
      font-weight: 900;
      margin-bottom: 2.5rem;
      text-align: center;
    }
    .success-details {
      margin-top: 2rem;
      margin-bottom: 2.5rem;
      text-align: center;
    }
    .success-amount {
      font-size: 2.2rem;
      color: #ffd600;
      font-weight: 800;
      margin-bottom: 1.2rem;
    }
    .success-id {
      font-size: 1.3rem;
      color: #fff;
      font-weight: 600;
      letter-spacing: 1px;
    }
    .transactions-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      background: #181c24;
      color: #fff;
      padding: 2rem 1rem;
      gap: 2.5rem;
    }
    .transactions-title {
      font-size: 2.2rem;
      font-weight: bold;
      margin-bottom: 2.5rem;
      color: #00e6d0;
      text-align: center;
      letter-spacing: 1px;
    }
    .no-transactions {
      color: #ffd600;
      font-size: 1.3rem;
      margin-top: 2rem;
    }
    .transaction-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      background: linear-gradient(135deg, #283593 0%, #00bfae 100%);
      border-radius: 2rem;
      padding: 1.2rem 1.5rem;
      box-shadow: none;
      margin-bottom: 1.2rem;
      margin-top: 0.3rem;
      gap: 1.2rem;
      width: 100%;
      max-width: 400px;
      min-height: 90px;
    }
    .transaction-photo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #fff;
      background: #fff;
      box-shadow: none;
    }
    .transaction-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      justify-content: center;
      align-items: flex-start;
    }
    .transaction-name {
      font-size: 1.2rem;
      color: #fff;
      font-weight: 900;
      letter-spacing: 1px;
    }
    .transaction-amount {
      font-size: 1.5rem;
      color: #ffd600;
      font-weight: 900;
      letter-spacing: 1.5px;
    }
    .transaction-id {
      font-size: 0.9rem;
      color: #00e6d0;
      font-weight: 500;
    }
    .transaction-date {
      font-size: 1rem;
      color: #fff200;
      font-weight: 700;
      letter-spacing: 1px;
      margin-top: 0.5rem;
    }
    .pause-btn, .play-btn {
      font-size: 1.2rem;
      padding: 0.5rem 1rem;
      border-radius: 0.6rem;
      border: none;
      background: #222b3a;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      margin-top: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    }
    .pause-btn:focus-visible, .play-btn:focus-visible {
      outline: 3px solid #ffd600;
      background: #283593;
      color: #ffd600;
    }
    .pause-btn:active, .play-btn:active {
      background: #ffd600;
      color: #222b3a;
    }
    .pin-entry-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #181c24;
      color: #fff;
      padding: 2rem 1rem;
    }
    .pin-title {
      font-size: 2.2rem;
      font-weight: bold;
      margin-bottom: 2.5rem;
      color: #00e6d0;
      text-align: center;
      letter-spacing: 1px;
    }
    .pin-input-container {
      margin-bottom: 2rem;
    }
    .pin-input {
      font-size: 2.5rem;
      padding: 1rem 2rem;
      border-radius: 1rem;
      border: 2px solid #00e6d0;
      background: #222b3a;
      color: #fff;
      font-weight: 700;
      text-align: center;
      outline: none;
      transition: border 0.2s;
      letter-spacing: 0.5rem;
      width: 220px;
    }
    .pin-input:focus {
      border: 2px solid #ffd600;
    }
    .pin-error {
      color: #ff5252;
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
      text-align: center;
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
  apiResponse = signal('');
  apiWords = signal<string[]>([]); // New: holds words as they are displayed
  apiShowFull = signal(false);    // New: controls when to show the full paragraph
  apiLoading = signal(false);
  speechPaused = signal(false); // New: track if speech is paused
  speechUtterance: SpeechSynthesisUtterance | null = null; // New: track current utterance
  private textRevealTimer: any = null; // Timer for word-by-word text
  private textRevealIdx: number = 0; // Current index for word-by-word text
  private textRevealWords: string[] = [];
  selectedLang = signal('en-IN');
  langOptions = [
    { value: 'en-IN', label: 'English' },
    { value: 'hi-IN', label: 'Hindi' },
    { value: 'de-DE', label: 'German' }
  ];
  selectedContact = signal<any | null>(null);
  amount = signal<number>(0);
  transaction = signal<any | null>(null);
  transactions = signal<any[]>([]);
  pinInput = signal(''); // New: holds the entered PIN
  pinError = signal(''); // New: error message for wrong PIN

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
    recognition.lang = this.selectedLang();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    this.isListening.set(true);
    this.spokenText.set('');
    this.apiResponse.set('');
    this.apiWords.set([]); // Reset words
    this.apiShowFull.set(false); // Reset full paragraph display
    this.apiLoading.set(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.spokenText.set(transcript);
      this.isListening.set(false);
      this.sendToExternalApi(transcript);
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

  sendToExternalApi(text: string) {
    this.apiLoading.set(true);
    this.apiWords.set([]); // Reset words
    this.apiShowFull.set(false); // Reset full paragraph display
    this.clearTextReveal();
    const encoded = encodeURIComponent(text);
    const url = `http://localhost:3001/api/voice-proxy?prompt=${encoded}`;
    fetch(url)
      .then(res => res.text())
      .then(data => {
        const cleaned = data
          .split('\n')
          .map(line => line.replace(/^data:/, '').trim())
          .filter(line => line.length > 0)
          .join(' ');
        this.apiResponse.set(cleaned);
        this.apiLoading.set(false);
        // Word-by-word display logic with pause/resume support
        this.textRevealWords = cleaned.split(/\s+/);
        this.textRevealIdx = 0;
        this.apiWords.set([]);
        this.apiShowFull.set(false);
        this.startTextReveal();
        this.speakResponse(cleaned);
      })
      .catch(() => {
        this.apiResponse.set('Error contacting external API.');
        this.apiWords.set(['Error contacting external API.']);
        this.apiShowFull.set(true);
        this.apiLoading.set(false);
        this.clearTextReveal();
      });
  }

  private startTextReveal() {
    this.clearTextReveal();
    if (this.textRevealIdx < this.textRevealWords.length) {
      this.apiWords.set(this.textRevealWords.slice(0, this.textRevealIdx + 1));
      this.textRevealTimer = setTimeout(() => {
        this.textRevealIdx++;
        this.startTextReveal();
      }, 350);
    } else {
      this.apiShowFull.set(true);
      this.clearTextReveal();
    }
  }

  private clearTextReveal() {
    if (this.textRevealTimer) {
      clearTimeout(this.textRevealTimer);
      this.textRevealTimer = null;
    }
  }

  speakResponse(text: string) {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices);
      this.speechUtterance = new window.SpeechSynthesisUtterance(text);
      this.speechUtterance.lang = this.selectedLang();
      // Try to select a matching voice for the selected language
      const match = voices.find(v => v.lang === this.selectedLang());
      if (match) {
        this.speechUtterance.voice = match;
      }
      this.speechUtterance.onend = () => {
        this.speechPaused.set(false);
        this.speechUtterance = null;
        this.clearTextReveal();
      };
      window.speechSynthesis.speak(this.speechUtterance);
      this.speechPaused.set(false);
    }
  }

  pauseSpeech() {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      this.speechPaused.set(true);
      this.clearTextReveal();
    }
  }

  resumeSpeech() {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.speechPaused.set(false);
      this.startTextReveal();
    }
  }

  onLangChange(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    if (select) {
      this.selectedLang.set(select.value);
    }
  }

  onContactClick(contact: any) {
    this.selectedContact.set(contact);
    this.currentPage.set('send-money-detail');
  }

  onAmountInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      this.amount.set(Number(input.value) || 0);
    }
  }

  addAmount(val: number) {
    this.amount.set((this.amount() || 0) + val);
  }

  sendMoney() {
    const contact = this.selectedContact();
    const amount = this.amount();
    // Instead of sending money immediately, go to PIN entry page
    this.pinInput.set('');
    this.pinError.set('');
    this.currentPage.set('enter-pin');
  }

  submitPin() {
    if (this.pinInput() === '1234') {
      // Proceed with transaction
      const contact = this.selectedContact();
      const amount = this.amount();
      fetch('http://localhost:3001/api/send-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, name: contact?.name, photo: contact?.photo })
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            alert(data.error || 'Transaction failed');
            return;
          }
          this.transaction.set({
            id: data.transactionId,
            name: contact?.name,
            photo: contact?.photo,
            amount
          });
          this.balance.set(data.newBalance);
          this.currentPage.set('transaction-success');
        })
        .catch(() => {
          alert('Failed to send money. Please try again.');
        });
    } else {
      this.pinError.set('Incorrect PIN. Please try again.');
    }
  }

  goHome() {
    this.currentPage.set('home');
    this.selectedContact.set(null);
    this.amount.set(0);
    this.transaction.set(null);
  }

  showTransactions() {
    fetch('http://localhost:3001/api/transactions')
      .then(res => res.json())
      .then(data => {
        this.transactions.set(data);
        this.currentPage.set('transactions');
      })
      .catch(() => {
        alert('Failed to fetch transactions.');
      });
  }

  getTxnDate(txn: any): Date | null {
    if (!txn.timestamp) return null;
    if (typeof txn.timestamp.toDate === 'function') {
      return txn.timestamp.toDate();
    }
    if (txn.timestamp._seconds) {
      return new Date(txn.timestamp._seconds * 1000);
    }
    return null;
  }
}
