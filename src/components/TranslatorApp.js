import React, { useState } from "react";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";

const TranslatorApp = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es"); // Default to Spanish
  const [isTranslating, setIsTranslating] = useState(false);

  // Azure Keys
  const speechKey = "Enter You Key";
  const speechRegion = "Enter Region";
  const translatorKey = "Enter Translator Key ";
  const translatorEndpoint = "end point";

  // Speech-to-Text
  const handleSpeechToText = async () => {
    const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    setIsTranslating(true);

    recognizer.recognizeOnceAsync((result) => {
      setInputText(result.text);
      recognizer.close();
      handleTranslation(result.text);
    });
  };

  // Translate Text
  const handleTranslation = async (text) => {
    try {
      const response = await fetch(
        `${translatorEndpoint}/translate?api-version=3.0&to=${targetLanguage}`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": translatorKey,
            "Ocp-Apim-Subscription-Region": speechRegion,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([{ Text: text }]),
        }
      );
      const data = await response.json();
      const translated = data[0].translations[0].text;
      setTranslatedText(translated);
      handleTextToSpeech(translated);
    } catch (error) {
      console.error("Translation Error:", error);
    }
  };

  // Text-to-Speech
  const handleTextToSpeech = (text) => {
    const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechSynthesisLanguage = targetLanguage; // Set target language for TTS
    const synthesizer = new SpeechSynthesizer(speechConfig);

    synthesizer.speakTextAsync(text, () => {
      synthesizer.close();
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Live Language Translator</h1>
      <button onClick={handleSpeechToText} disabled={isTranslating}>
        {isTranslating ? "Listening..." : "Start Speaking"}
      </button>
      <div style={{ margin: "20px 0" }}>
        <h3>Original Text:</h3>
        <p>{inputText || "No input yet"}</p>
      </div>
      <div style={{ margin: "20px 0" }}>
        <h3>Translated Text:</h3>
        <p>{translatedText || "No translation yet"}</p>
      </div>
      <div>
        <label>Target Language: </label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="hi"> Hindi</option>
        </select>
      </div>
    </div>
  );
};

export default TranslatorApp;
