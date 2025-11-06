import React, { useState, useEffect } from 'react';
import { submitGameScore } from '../services/apiService'; // স্কোর জমা দেওয়ার ফাংশন
import { Box, Typography, Grid, Paper, Button, Fade, CircularProgress } from '@mui/material'; // MUI কম্পোনেন্ট

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
function MatchingGameComponent({ gameData, onGameComplete }) {
  const [itemsA, setItemsA] = useState([]);
  const [itemsB, setItemsB] = useState([]);
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  const [correctMatches, setCorrectMatches] = useState(new Set());
  const [wrongMatch, setWrongMatch] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // স্কোর জমা দেওয়ার সময় লোডিং
  const [scoreSubmitted, setScoreSubmitted] = useState(false); // স্কোর জমা হয়েছে কি না

  // গেম সেটআপ
  useEffect(() => {
    if (!gameData || !gameData.pairs) return; // ডেটা না থাকলে কিছু করার নেই

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
  const handleSelectA = (item) => {
    if (correctMatches.has(item.id) || selectedA?.id === item.id || isSubmitting) return; // সাবমিট করার সময় ক্লিক বন্ধ
    setSelectedA(item);
  };
  const handleSelectB = (item) => {
    if (correctMatches.has(item.id) || selectedB?.id === item.id || isSubmitting) return; // সাবমিট করার সময় ক্লিক বন্ধ
    setSelectedB(item);
  };

  // জোড়া মেলানোর যুক্তি
  useEffect(() => {
    if (selectedA && selectedB) {
      if (selectedA.id === selectedB.id) {
        setCorrectMatches(prev => new Set(prev).add(selectedA.id));
      } else {
        setWrongMatch({ a: selectedA.id, b: selectedB.id });
        setTimeout(() => setWrongMatch(null), 800); // ভুল দেখানোর সময় একটু কমানো হলো
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
      submitGameScore(gameData.id, 100) // ম্যাচিং গেমের স্কোর ১০০%
        .then(() => {
          console.log("গেমের স্কোর সফলভাবে সেভ হয়েছে!");
          setScoreSubmitted(true);
        })
        .catch(error => {
          console.error("গেমের স্কোর সেভ করতে সমস্যা হয়েছে:", error);
        })
        .finally(() => {
          setIsSubmitting(false);
          // গেম শেষ এবং স্কোর জমা দেওয়া শেষ হলে CourseDetailPage-কে জানানো
          if(onGameComplete) {
              onGameComplete();
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameComplete, scoreSubmitted, gameData.id]); // isSubmitting বাদ দেওয়া হলো লুপ এড়ানোর জন্য

  // আইটেমের স্টাইল নির্ধারণ
  const getItemStyle = (item, column) => {
    const isSelected = (column === 'A' && selectedA?.id === item.id) || (column === 'B' && selectedB?.id === item.id);
    const isCorrect = correctMatches.has(item.id);
    const isWrong = (column === 'A' && wrongMatch?.a === item.id) || (column === 'B' && wrongMatch?.b === item.id);
    const baseCursor = isCorrect || isSubmitting ? 'default' : 'pointer'; // সঠিক হলে বা সাবমিট করার সময় কার্সার পরিবর্তন

    if (isCorrect) return { background: '#c8e6c9', color: '#2e7d32', cursor: baseCursor, transition: 'background 0.3s ease' };
    if (isSelected) return { background: '#bbdefb', cursor: baseCursor, transition: 'background 0.3s ease' };
    if (isWrong) return { background: '#ffcdd2', color: '#d32f2f', cursor: baseCursor, transition: 'background 0.3s ease' };
    return { background: 'white', cursor: baseCursor, transition: 'background 0.3s ease' };
  };

  // যদি গেমের ডেটা না থাকে বা জোড়া খালি থাকে
  if (!gameData || !gameData.pairs || gameData.pairs.length === 0) {
    return <Typography>এই গেমটিতে কোনো জোড়া যোগ করা হয়নি।</Typography>;
  }

  // মূল UI
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        {gameData.title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        সঠিক জোড়াগুলো মেলান:
      </Typography>

      {isGameComplete ? (
        <Fade in={true}>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              🎉 অভিনন্দন! আপনি সফলভাবে গেমটি সম্পন্ন করেছেন! 🎉
            </Typography>
            {isSubmitting ? (
              <CircularProgress size={24} sx={{ mt: 2 }} />
            ) : scoreSubmitted ? (
               <Typography color="text.secondary" sx={{ mt: 1 }}>স্কোর সফলভাবে সেভ হয়েছে।</Typography>
            ) : (
               <Typography color="error" sx={{ mt: 1 }}>স্কোর সেভ করা যায়নি। আবার চেষ্টা করুন।</Typography>
            )}
            {/* পরবর্তী ধাপের বাটন CourseDetailPage-এ দেখানো হবে */}
          </Box>
        </Fade>
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* কলাম A */}
          <Grid item xs={6}>
            <Box>
              {itemsA.map(item => (
                <Paper
                  elevation={selectedA?.id === item.id ? 6 : 2} // সিলেক্ট করলে শ্যাডো বাড়বে
                  key={`a-${item.id}`} // Unique key
                  onClick={() => handleSelectA(item)}
                  sx={{ p: 2, mb: 1, ...getItemStyle(item, 'A') }}
                >
                  {item.text}
                </Paper>
              ))}
            </Box>
          </Grid>

          {/* কলাম B */}
          <Grid item xs={6}>
            <Box>
              {itemsB.map(item => (
                <Paper
                  elevation={selectedB?.id === item.id ? 6 : 2} // সিলেক্ট করলে শ্যাডো বাড়বে
                  key={`b-${item.id}`} // Unique key
                  onClick={() => handleSelectB(item)}
                  sx={{ p: 2, mb: 1, ...getItemStyle(item, 'B') }}
                >
                  {item.text}
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default MatchingGameComponent;