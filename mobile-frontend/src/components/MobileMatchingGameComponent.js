import React, { useState, useEffect } from 'react';
// --- আমরা শুধু React Native-এর নিজস্ব কম্পোনেন্ট ব্যবহার করছি ---
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Button } from 'react-native';
import { submitGameScoreApi } from '../services/api';

// অ্যারে এলোমেলো করার ফাংশন
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// gameData এবং onGameComplete prop হিসেবে আসছে
const MobileMatchingGameComponent = ({ gameData, onGameComplete }) => {
  const [itemsA, setItemsA] = useState([]);
  const [itemsB, setItemsB] = useState([]);
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  const [correctMatches, setCorrectMatches] = useState(new Set());
  const [wrongMatch, setWrongMatch] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // গেম সেটআপ
  useEffect(() => {
    if (!gameData || !gameData.pairs) return;
    const columnA = gameData.pairs.map(p => ({ id: p.id, text: p.item_a }));
    setItemsA(columnA);
    const columnB = gameData.pairs.map(p => ({ id: p.id, text: p.item_b }));
    setItemsB(shuffleArray(columnB));
    
    // গেম রিসেট
    setSelectedA(null);
    setSelectedB(null);
    setCorrectMatches(new Set());
    setWrongMatch(null);
    setScoreSubmitted(false);
    setIsSubmitting(false);
  }, [gameData]);

  // আইটেম সিলেক্ট করার হ্যান্ডলার
  const handleSelect = (item, column) => {
    if (correctMatches.has(item.id) || isSubmitting) return;
    if (column === 'A') {
      if (selectedA?.id === item.id) setSelectedA(null);
      else setSelectedA(item);
    } else {
      if (selectedB?.id === item.id) setSelectedB(null);
      else setSelectedB(item);
    }
  };

  // জোড়া মেলানোর যুক্তি
  useEffect(() => {
    if (selectedA && selectedB) {
      if (selectedA.id === selectedB.id) {
        setCorrectMatches(prev => new Set(prev).add(selectedA.id));
      } else {
        setWrongMatch({ a: selectedA.id, b: selectedB.id });
        setTimeout(() => setWrongMatch(null), 800);
      }
      setSelectedA(null);
      setSelectedB(null);
    }
  }, [selectedA, selectedB]);

  // গেম শেষ হয়েছে কি না
  const isGameComplete = itemsA.length > 0 && correctMatches.size === itemsA.length;

  // গেম শেষ হলে স্কোর জমা দেওয়ার যুক্তি
  useEffect(() => {
    if (isGameComplete && !scoreSubmitted && !isSubmitting) {
      setIsSubmitting(true);
      submitGameScoreApi(gameData.id, 100)
        .then(() => {
          console.log("গেমের স্কোর সফলভাবে সেভ হয়েছে!");
          setScoreSubmitted(true);
        })
        .catch(error => {
          console.error("গেমের স্কোর সেভ করতে সমস্যা হয়েছে:", error);
        })
        .finally(() => {
          setIsSubmitting(false);
          if(onGameComplete) {
              onGameComplete();
          }
        });
    }
  }, [isGameComplete, scoreSubmitted, gameData.id, onGameComplete, isSubmitting]);

  // আইটেমের স্টাইল নির্ধারণ
  const getItemStyle = (item, column) => {
    const isSelected = (column === 'A' && selectedA?.id === item.id) || (column === 'B' && selectedB?.id === item.id);
    const isCorrect = correctMatches.has(item.id);
    const isWrong = (column === 'A' && wrongMatch?.a === item.id) || (column === 'B' && wrongMatch?.b === item.id);
    
    if (isCorrect) return [styles.itemContainer, styles.correct];
    if (isSelected) return [styles.itemContainer, styles.selected];
    if (isWrong) return [styles.itemContainer, styles.wrong];
    return styles.itemContainer;
  };

  if (!gameData || !gameData.pairs || gameData.pairs.length === 0) {
    return <Text style={styles.infoText}>এই গেমটিতে কোনো জোড়া যোগ করা হয়নি।</Text>;
  }

  // গেম শেষ হলে ফলাফল দেখাবে
  if (isGameComplete) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>🎉 অভিনন্দন! 🎉</Text>
        <Text style={styles.resultSubTitle}>আপনি সফলভাবে গেমটি সম্পন্ন করেছেন!</Text>
        {isSubmitting ? (
          <ActivityIndicator size="small" style={{ marginVertical: 10 }} />
        ) : scoreSubmitted ? (
          <Text style={styles.infoText}>স্কোর সেভ হয়েছে।</Text>
        ) : (
          <Text style={[styles.infoText, { color: 'red' }]}>স্কোর সেভ করা যায়নি।</Text>
        )}
      </View>
    );
  }

  // গেম দেখানোর UI (শুধুমাত্র View এবং Text দিয়ে)
  return (
    <View style={styles.gameContainer}>
      <View style={styles.column}>
        {itemsA.map(item => (
          <TouchableOpacity key={`a-${item.id}`} onPress={() => handleSelect(item, 'A')} disabled={correctMatches.has(item.id) || isSubmitting}>
            <View style={getItemStyle(item, 'A')}>
              <Text style={styles.itemText}>{item.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.column}>
        {itemsB.map(item => (
          <TouchableOpacity key={`b-${item.id}`} onPress={() => handleSelect(item, 'B')} disabled={correctMatches.has(item.id) || isSubmitting}>
            <View style={getItemStyle(item, 'B')}>
              <Text style={styles.itemText}>{item.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// --- নতুন, সহজ স্টাইল ---
const styles = StyleSheet.create({
  infoText: { padding: 20, textAlign: 'center', fontSize: 16, color: '#888' },
  gameContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { width: '48%' },
  itemContainer: { 
    padding: 15, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    minHeight: 60, 
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  itemText: { fontSize: 16 },
  selected: { 
    borderWidth: 2, 
    borderColor: '#3498DB', // নীল
    backgroundColor: '#eaf5fd',
  },
  correct: { 
    borderWidth: 1, 
    borderColor: '#2ECC71', // সবুজ
    backgroundColor: '#e8f8ee',
    opacity: 0.6,
  },
  wrong: { 
    borderWidth: 2, 
    borderColor: '#e74c3c', // লাল
    backgroundColor: '#fdeded',
  },
  resultContainer: { 
    padding: 20, 
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  resultTitle: { 
    textAlign: 'center', 
    color: '#27ae60', // সবুজ
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultSubTitle: { 
    textAlign: 'center', 
    fontSize: 16, 
    marginTop: 10,
  }
});

export default MobileMatchingGameComponent;