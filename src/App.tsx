/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Lightbulb, 
  Fan, 
  Blinds, 
  Tv, 
  DoorOpen, 
  Moon, 
  PartyPopper, 
  PowerOff, 
  Bluetooth, 
  Code, 
  Smartphone, 
  Cpu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Command {
  id: string;
  voice: string[];
  action: string;
  icon: React.ReactNode;
  code: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

// --- Constants ---
const COMMANDS: Command[] = [
  { id: 'living_on', voice: ['світло у вітальні увімкнути', 'увімкни світло у вітальні'], action: 'Living Room ON', icon: <Lightbulb className="w-5 h-5" />, code: 'L1_ON' },
  { id: 'living_off', voice: ['світло у вітальні вимкнути', 'вимкни світло у вітальні'], action: 'Living Room OFF', icon: <Lightbulb className="text-slate-400 w-5 h-5" />, code: 'L1_OFF' },
  { id: 'kitchen_on', voice: ['світло в кухні увімкнути', 'увімкни світло в кухні'], action: 'Kitchen ON', icon: <Lightbulb className="w-5 h-5" />, code: 'K1_ON' },
  { id: 'kitchen_off', voice: ['світло в кухні вимкнути', 'вимкни світло в кухні'], action: 'Kitchen OFF', icon: <Lightbulb className="text-slate-400 w-5 h-5" />, code: 'K1_OFF' },
  { id: 'fan_on', voice: ['увімкнути вентилятор', 'включи вентилятор'], action: 'Fan ON', icon: <Fan className="w-5 h-5 animate-spin" />, code: 'F1_ON' },
  { id: 'fan_off', voice: ['вимкнути вентилятор'], action: 'Fan OFF', icon: <Fan className="text-slate-400 w-5 h-5" />, code: 'F1_OFF' },
  { id: 'blinds_open', voice: ['відкрити штори', 'відкрий штори'], action: 'Blinds Open', icon: <Blinds className="w-5 h-5" />, code: 'S1_OPEN' },
  { id: 'blinds_close', voice: ['закрити штори', 'закрий штори'], action: 'Blinds Closed', icon: <Blinds className="text-slate-400 w-5 h-5" />, code: 'S1_CLOSE' },
  { id: 'party', voice: ['режим вечірки', 'вечірка'], action: 'Party Mode', icon: <PartyPopper className="w-5 h-5" />, code: 'PARTY' },
  { id: 'all_off', voice: ['вимкнути все', 'все вимкнути'], action: 'All Off', icon: <PowerOff className="w-5 h-5" />, code: 'ALL_OFF' },
  { id: 'door_open', voice: ['відкрити двері', 'двері відкрити'], action: 'Door Open', icon: <DoorOpen className="w-5 h-5" />, code: 'D1_OPEN' },
  { id: 'door_close', voice: ['закрити двері', 'двері закрити'], action: 'Door Locked', icon: <DoorOpen className="text-slate-400 w-5 h-5" />, code: 'D1_CLOSE' },
  { id: 'tv_on', voice: ['увімкнути телевізор', 'включи телевізор'], action: 'TV ON', icon: <Tv className="w-5 h-5" />, code: 'T1_ON' },
  { id: 'tv_off', voice: ['вимкнути телевізор'], action: 'TV OFF', icon: <Tv className="text-slate-400 w-5 h-5" />, code: 'T1_OFF' },
  { id: 'night', voice: ['нічне світло', 'ніч'], action: 'Night Light', icon: <Moon className="w-5 h-5" />, code: 'N1_ON' },
];

const ARDUINO_CODE = `
// --- SMART HOME CONTROLLER V2.0 (DIPLOMA VERSION) ---
// Hardware: Arduino R3 + HC-06 Bluetooth
#include <SoftwareSerial.h>

SoftwareSerial BT(2, 3); // BlueTooth RX(2), TX(3)

// Дефініції пінів
const int RELAY_LIVING_ROOM = 4;
const int RELAY_KITCHEN     = 5;
const int MOTOR_FAN        = 6;
const int SERVO_BLINDS     = 7;
const int LED_NIGHT        = 8;
const int BUZZER_PIN       = 9;

void setup() {
  Serial.begin(9600);
  BT.begin(9600);
  
  pinMode(RELAY_LIVING_ROOM, OUTPUT);
  pinMode(RELAY_KITCHEN, OUTPUT);
  pinMode(MOTOR_FAN, OUTPUT);
  pinMode(SERVO_BLINDS, OUTPUT);
  pinMode(LED_NIGHT, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Сигнал готовності системи
  beep(2);
  Serial.println("System Initialized. Waiting for BT data...");
}

void loop() {
  if (BT.available()) {
    String rawData = BT.readStringUntil('\n');
    rawData.trim();
    processCommand(rawData);
  }
}

// Функція обробки команд (Парсер нижнього рівня)
void processCommand(String cmd) {
  Serial.print("Executing action for: "); 
  Serial.println(cmd);
  
  if (cmd == "L1_ON") { digitalWrite(RELAY_LIVING_ROOM, HIGH); beep(1); }
  else if (cmd == "L1_OFF") { digitalWrite(RELAY_LIVING_ROOM, LOW); beep(1); }
  else if (cmd == "K1_ON") { digitalWrite(RELAY_KITCHEN, HIGH); beep(1); }
  else if (cmd == "K1_OFF") { digitalWrite(RELAY_KITCHEN, LOW); beep(1); }
  else if (cmd == "FAN_ON") { analogWrite(MOTOR_FAN, 255); beep(1); }
  else if (cmd == "FAN_OFF") { analogWrite(MOTOR_FAN, 0); beep(1); }
  else if (cmd == "ALL_OFF") { 
    digitalWrite(RELAY_LIVING_ROOM, LOW);
    digitalWrite(RELAY_KITCHEN, LOW);
    analogWrite(MOTOR_FAN, 0);
    digitalWrite(LED_NIGHT, LOW);
    beep(3);
  }
  // Додайте інші умови за аналогією
}

void beep(int times) {
  for(int i=0; i<times; i++) {
    digitalWrite(BUZZER_PIN, HIGH); delay(100);
    digitalWrite(BUZZER_PIN, LOW); delay(100);
  }
}
`.trim();

const ANDROID_CODE = `
// --- ANDROID STUDIO: VOICE COMMAND PROCESSOR ---
// MainActivity.kt (Kotlin)

package com.example.smarthome

import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.content.Intent
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import java.util.*

class MainActivity : AppCompatActivity() {

    private lateinit var speechRecognizer: SpeechRecognizer
    private lateinit var statusText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.status_text)
        initVoiceEngine()

        findViewById<Button>(R.id.btn_listen).setOnClickListener {
            startListening()
        }
    }

    private fun initVoiceEngine() {
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        speechRecognizer.setRecognitionListener(object : RecognitionListener {
            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (matches != null) {
                    val rawText = matches[0].toLowerCase(Locale.ROOT)
                    statusText.text = "Почуто: $rawText"
                    
                    // --- ЛОГІЧНИЙ ЦЕНТР (Парсер) ---
                    // Це серце вашої програми, яке "розбирає" голос
                    analyzeAndExecute(rawText)
                }
            }
            // ... інші методи Listener-а
        })
    }

    /**
     * АЛГОРИТМ АНАЛІЗУ КОМАНД (Для диплома)
     * Тут ми реалізуємо власну логіку розпізнавання сенсу, 
     * а не просто використовуємо Google.
     */
    private fun analyzeAndExecute(text: String) {
        // Визначаємо ключові слова для "нечіткого" пошуку
        val dictionary = mapOf(
            "вітальня" to "L1",
            "кухня" to "K1",
            "увімкнути" to "ON",
            "включи" to "ON",
            "вимкнути" to "OFF",
            "виключи" to "OFF",
            "вентилятор" to "FAN",
            "все" to "ALL"
        )

        var targetCommand = ""
        
        // Пошук збігів у словнику
        if (text.contains("світло") || text.contains("лампу")) {
            if (text.contains("вітальня")) targetCommand = "L1"
            else if (text.contains("кухня")) targetCommand = "K1"
        } else if (text.contains("вентилятор")) {
            targetCommand = "FAN"
        }

        // Визначення дії
        val action = if (text.contains("увімкнути") || text.contains("включи")) "_ON" 
                     else if (text.contains("вимкнути") || text.contains("виключи")) "_OFF"
                     else ""

        val finalCode = targetCommand + action

        if (finalCode.isNotEmpty()) {
            sendBluetooth(finalCode)
        } else if (text.contains("вимкнути все")) {
            sendBluetooth("ALL_OFF")
        }
    }

    private fun sendBluetooth(command: String) {
        // Тут код відправки через BluetoothSocket
        Toast.makeText(this, "Команда для Arduino: $command", Toast.LENGTH_SHORT).show()
    }
}
`.trim();


export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ui' | 'code'>('ui');
  const [codeType, setCodeType] = useState<'arduino' | 'android'>('arduino');
  const [history, setHistory] = useState<{ time: string, text: string, status: 'success' | 'fail' }[]>([]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'uk-UA'; // Ukrainian language
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setTranscript(text);
        handleVoiceCommand(text);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleVoiceCommand = (text: string) => {
    const matched = COMMANDS.find(cmd => 
      cmd.voice.some(v => text.includes(v.toLowerCase()))
    );

    const newHistory = {
      time: new Date().toLocaleTimeString(),
      text: text,
      status: matched ? 'success' : 'fail' as const
    };

    setHistory(prev => [newHistory, ...prev].slice(0, 5));

    if (matched) {
      setLastCommand(matched.action);
      setTimeout(() => setLastCommand(null), 3000);
      // In a real app, this is where you'd send via Bluetooth
      console.log(`Sending Bluetooth: ${matched.code}`);
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text font-sans p-0 flex flex-col md:flex-row">
      {/* Sidebar - Inspired by HomeSync sidebar */}
      <aside className="w-full md:w-72 bg-natural-sidebar border-r border-natural-border flex flex-col shrink-0">
        <div className="p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#5A5A4D] flex items-center gap-2">
            HomeSync
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-natural-muted mt-1 font-bold">Voice Butler v2.1</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('ui')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition duration-300 ${activeTab === 'ui' ? 'bg-natural-bg shadow-sm text-natural-text' : 'text-natural-muted hover:bg-natural-bg/50'}`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'ui' ? 'bg-natural-sage' : 'border border-natural-muted'}`}></div>
            <span className="font-medium text-sm">Інтерфейс</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('code')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition duration-300 ${activeTab === 'code' ? 'bg-natural-bg shadow-sm text-natural-text' : 'text-natural-muted hover:bg-natural-bg/50'}`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'code' ? 'bg-natural-sage' : 'border border-natural-muted'}`}></div>
            <span className="font-medium text-sm">Код Arduino/App</span>
          </button>
        </nav>

        <div className="p-6 bg-[#DFDCD5] m-4 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-natural-muted">BT Status</span>
            <span className="text-[9px] bg-natural-sage text-white px-2 py-0.5 rounded-full font-bold">HC-06 Linked</span>
          </div>
          <div className="text-xs text-[#6B6B5E] flex items-center gap-2">
            <Bluetooth className="w-3 h-3" />
            Arduino Uno R3 Connected
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto max-h-screen">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-natural-border shrink-0 bg-natural-bg/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-natural-sage rounded-full flex items-center justify-center text-white shadow-lg shadow-natural-sage/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm md:text-base">
                {isListening ? 'Слухаю...' : lastCommand ? `Виконано: ${lastCommand}` : 'Очікування вводу...'}
              </h2>
              <p className="text-[10px] md:text-xs text-natural-muted italic">Спробуйте: "увімкни світло у вітальні"</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-natural-border flex items-center justify-center text-xs opacity-50 cursor-not-allowed">⚙️</div>
            <div className="w-10 h-10 rounded-2xl bg-white border border-natural-border flex items-center justify-center text-xs opacity-50 cursor-not-allowed">👤</div>
          </div>
        </header>

        {activeTab === 'ui' ? (
          <div className="flex-1 flex flex-col">
            {/* Visual Recognition Center */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12 relative overflow-hidden min-h-[300px]">
              {/* Background abstract elements */}
              <div className="absolute w-[500px] h-[500px] bg-natural-sage/5 rounded-full blur-3xl -top-40 -left-40" />
              <div className="absolute w-[400px] h-[400px] bg-natural-clay/5 rounded-full blur-3xl -bottom-40 -right-20" />

              <div className="relative flex items-center justify-center">
                {/* Rings */}
                <motion.div 
                  animate={{ scale: isListening ? [1, 1.1, 1] : 1, opacity: isListening ? [0.1, 0.2, 0.1] : 0.05 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-64 h-64 border-2 border-natural-sage rounded-full" 
                />
                <motion.div 
                   animate={{ scale: isListening ? [1, 1.2, 1] : 1, opacity: isListening ? [0.05, 0.1, 0.05] : 0.02 }}
                   transition={{ duration: 3, repeat: Infinity }}
                  className="absolute w-80 h-80 border border-natural-sage rounded-full" 
                />
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleListening}
                  className="w-40 h-40 md:w-48 md:h-48 bg-white shadow-2xl shadow-natural-sage/15 rounded-full flex flex-col items-center justify-center gap-4 z-10 border-8 border-natural-bg group relative"
                >
                  {isListening ? (
                    <div className="w-16 h-8 flex gap-1 justify-center items-center">
                      <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-natural-sage rounded-full" />
                      <motion.div animate={{ height: [12, 24, 12] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1.5 bg-natural-sage rounded-full" />
                      <motion.div animate={{ height: [10, 20, 10] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1.5 bg-natural-sage rounded-full" />
                      <motion.div animate={{ height: [14, 28, 14] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 bg-natural-sage rounded-full" />
                    </div>
                  ) : (
                    <Mic className="w-10 h-10 text-natural-sage transition-transform group-hover:scale-110" />
                  )}
                  <span className={`font-bold tracking-widest text-[10px] uppercase ${isListening ? 'text-natural-sage' : 'text-natural-muted'}`}>
                    {isListening ? 'Слухаю' : 'Натисніть'}
                  </span>
                </motion.button>
              </div>

              {/* Transcript Display */}
              <AnimatePresence>
                {transcript && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-12 bg-white/80 backdrop-blur px-6 py-3 rounded-2xl border border-natural-border shadow-lg"
                  >
                    <p className="text-sm font-medium italic">"{transcript}"</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Commands Grid */}
            <div className="p-6 md:p-10 bg-natural-stone/50 border-t border-natural-border">
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-natural-muted">Active Command Map ({COMMANDS.length} Nodes)</h3>
                
                <div className="flex gap-4">
                  {history.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${history[0].status === 'success' ? 'bg-green-500' : 'bg-red-400'}`}></div>
                      <span className="text-[10px] font-bold text-natural-muted uppercase">Last: {history[0].time}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {COMMANDS.map((cmd, idx) => (
                  <motion.div
                    key={cmd.id}
                    whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(142, 155, 130, 0.1)' }}
                    className="bg-white p-5 rounded-[2rem] border border-natural-border shadow-sm flex flex-col justify-between min-h-[110px] group transition-colors hover:border-natural-sage"
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        idx % 3 === 0 ? 'text-natural-sage border-natural-sage/20 bg-natural-sage/5' : 
                        idx % 3 === 1 ? 'text-natural-clay border-natural-clay/20 bg-natural-clay/5' : 
                        'text-natural-steel border-natural-steel/20 bg-natural-steel/5'
                      }`}>
                        {cmd.code.split('_')[0]}-{String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="text-natural-muted group-hover:text-natural-sage transition-colors">
                        {React.cloneElement(cmd.icon as React.ReactElement, { className: 'w-4 h-4' })}
                      </div>
                    </div>
                    <div className="space-y-1 mt-3">
                      <div className="font-semibold text-xs text-natural-text group-hover:text-natural-sage transition-colors">{cmd.action}</div>
                      <div className="text-[9px] text-natural-muted truncate italic">"{cmd.voice[0]}"</div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Special Master Off Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-natural-sage p-5 rounded-[2rem] text-white shadow-lg shadow-natural-sage/20 flex flex-col justify-between min-h-[110px] cursor-pointer"
                  onClick={() => handleVoiceCommand('вимкнути все')}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-white/70 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">A-11</span>
                    <PowerOff className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 mt-3">
                    <div className="font-bold text-xs uppercase tracking-wider">Master Power Off</div>
                    <div className="text-[9px] text-white/70 italic">"вимкнути все"</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-10 space-y-8 flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                <Code className="text-natural-sage w-8 h-8" />
                Terminal Blueprint
              </h2>
              
              <div className="flex bg-natural-sidebar p-1 rounded-2xl border border-natural-border">
                <button 
                  onClick={() => setCodeType('arduino')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition ${codeType === 'arduino' ? 'bg-white text-natural-sage shadow-sm' : 'text-natural-muted'}`}
                >
                  Arduino
                </button>
                <button 
                  onClick={() => setCodeType('android')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition ${codeType === 'android' ? 'bg-white text-natural-sage shadow-sm' : 'text-natural-muted'}`}
                >
                  Android
                </button>
              </div>
            </div>

            <div className="bg-white border-2 border-natural-border rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <div className="bg-natural-sidebar/50 px-8 py-4 border-b border-natural-border flex justify-between items-center">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#E57373]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFB74D]" />
                  <div className="w-3 h-3 rounded-full bg-[#81C784]" />
                </div>
                <span className="text-[10px] font-mono font-bold text-natural-muted uppercase">{codeType === 'arduino' ? 'Controller.ino' : 'Terminal.kt'}</span>
              </div>
              <div className="p-8 overflow-x-auto bg-[#FAFAFA]">
                <pre className="text-xs font-mono leading-relaxed text-[#5A5A4D]">
                  <code>{codeType === 'arduino' ? ARDUINO_CODE : ANDROID_CODE}</code>
                </pre>
              </div>
            </div>

            <div className="p-8 bg-[#8E9B82]/10 border border-[#8E9B82]/20 rounded-[2rem] flex gap-6 items-start">
              <div className="w-12 h-12 bg-natural-sage rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-natural-sage uppercase text-xs tracking-widest">Hardware Architecture Tip</h4>
                <p className="text-natural-muted text-sm leading-relaxed">
                  При підключенні HC-06 до Arduino R3 використовуйте піни 2 (RX) та 3 (TX). Не забудьте об'єднати "землі" (GND) модуля та Arduino. 
                  Для Android додатку використовуйте UUID <code className="bg-white px-1.5 rounded border border-natural-border">00001101...</code> для стандартного SPP профілю.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>

  );
}
