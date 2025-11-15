import React, { useState, useEffect } from 'react';
import { Share2, Copy, ChevronLeft, Trophy, Clock } from 'lucide-react';
import { THEMES_DATA } from './data.js';

const VersusGame = () => {
  const [screen, setScreen] = useState('home'); // home, setup, game, result
  const [setupStep, setSetupStep] = useState(0); // 0: theme, 1: mode, 2: timer
  const [theme, setTheme] = useState(null);
  const [mode, setMode] = useState(null);
  const [timer, setTimer] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentOption1, setCurrentOption1] = useState(null);
  const [currentOption2, setCurrentOption2] = useState(null);
  const [winner, setWinner] = useState(null);
  const [usedItems, setUsedItems] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [bracket, setBracket] = useState(null);
  const [bracketProgress, setBracketProgress] = useState(0);

  useEffect(() => {
    // Cargar resultado compartido desde URL
    const params = new URLSearchParams(window.location.search);
    const sharedWinner = params.get('winner');
    const sharedTheme = params.get('theme');
    const sharedMode = params.get('mode');

    if (sharedWinner && sharedTheme) {
      setWinner(sharedWinner);
      setTheme(sharedTheme);
      setMode(sharedMode || '1v1');
      setScreen('result');
    }
  }, []);

  useEffect(() => {
    if (countdown !== null && countdown > 0 && screen === 'game') {
      const timeout = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timeout);
    } else if (countdown === 0) {
      handleAutoSelect();
    }
  }, [countdown, screen]);

  const startGame = () => {
    setScreen('setup');
    setSetupStep(0);
  };

  const selectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    const allItems = THEMES_DATA[selectedTheme].items;
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);
    setSelectedItems(shuffled.slice(0, 16));
    setSetupStep(1);
  };

  const selectMode = (selectedMode) => {
    setMode(selectedMode);
    setSetupStep(2);
  };

  const selectTimer = (selectedTimer) => {
    setTimer(selectedTimer);
    if (mode === 'pyramid') {
      initPyramid(selectedTimer);
    } else {
      initOneVsOne(selectedTimer);
    }
    setScreen('game');
  };

  const initOneVsOne = (timerValue) => {
    setCurrentRound(0);
    setUsedItems([]);
    const item1 = selectedItems[Math.floor(Math.random() * selectedItems.length)];
    const available = selectedItems.filter(i => i !== item1);
    const item2 = available[Math.floor(Math.random() * available.length)];
    setCurrentOption1(item1);
    setCurrentOption2(item2);
    if (timerValue !== 'NO') {
      setCountdown(parseInt(timerValue));
    }
  };

  const initPyramid = (timerValue) => {
    const shuffled = [...selectedItems].sort(() => Math.random() - 0.5);
    const newBracket = {
      round16: shuffled.map((item, i) => ({ id: i, name: item, winner: null })),
      round8: [],
      round4: [],
      round2: [],
      final: null
    };
    setBracket(newBracket);
    setBracketProgress(0);
    setCurrentOption1(shuffled[0]);
    setCurrentOption2(shuffled[1]);
    if (timerValue !== 'NO') {
      setCountdown(parseInt(timerValue));
    }
  };

  const handleAutoSelect = () => {
    if (mode === '1v1') {
      if (currentRound === 0) {
        selectOption(currentOption1);
      } else {
        selectOption(winner);
      }
    } else {
      selectOption(currentOption1);
    }
  };

  const selectOption = (option) => {
    if (mode === '1v1') {
      const newUsed = [...usedItems, currentOption1, currentOption2];
      setUsedItems(newUsed);

      if (currentRound >= 9) {
        setWinner(option);
        setScreen('result');
        updateURL(option);
        return;
      }

      const available = selectedItems.filter(i => !newUsed.includes(i) && i !== option);
      const nextItem = available[Math.floor(Math.random() * available.length)];

      setWinner(option);
      setCurrentOption1(option);
      setCurrentOption2(nextItem);
      setCurrentRound(currentRound + 1);

      if (timer !== 'NO') {
        setCountdown(parseInt(timer));
      }
    } else {
      handlePyramidSelection(option);
    }
  };

  const handlePyramidSelection = (option) => {
    const newBracket = { ...bracket };
    const matchIndex = Math.floor(bracketProgress / 2);

    if (bracketProgress < 8) {
      // Octavos de final
      newBracket.round8.push({ name: option, winner: null });

      if (bracketProgress < 7) {
        const nextMatch = bracketProgress + 1;
        setCurrentOption1(bracket.round16[nextMatch * 2].name);
        setCurrentOption2(bracket.round16[nextMatch * 2 + 1].name);
        setBracketProgress(bracketProgress + 1);
      } else {
        // Pasar a cuartos
        setCurrentOption1(newBracket.round8[0].name);
        setCurrentOption2(newBracket.round8[1].name);
        setBracketProgress(8);
      }
    } else if (bracketProgress < 12) {
      // Cuartos de final
      newBracket.round4.push({ name: option, winner: null });

      if (bracketProgress < 11) {
        const nextQuarter = newBracket.round4.length;
        setCurrentOption1(newBracket.round8[nextQuarter * 2].name);
        setCurrentOption2(newBracket.round8[nextQuarter * 2 + 1].name);
        setBracketProgress(bracketProgress + 1);
      } else {
        // Pasar a semis
        setCurrentOption1(newBracket.round4[0].name);
        setCurrentOption2(newBracket.round4[1].name);
        setBracketProgress(12);
      }
    } else if (bracketProgress < 14) {
      // Semifinales
      newBracket.round2.push({ name: option, winner: null });

      if (bracketProgress < 13) {
        setCurrentOption1(newBracket.round4[2].name);
        setCurrentOption2(newBracket.round4[3].name);
        setBracketProgress(13);
      } else {
        // Pasar a final
        setCurrentOption1(newBracket.round2[0].name);
        setCurrentOption2(newBracket.round2[1].name);
        setBracketProgress(14);
      }
    } else {
      // Final
      newBracket.final = option;
      setWinner(option);
      setScreen('result');
      updateURL(option);
      setBracket(newBracket);
      return;
    }

    setBracket(newBracket);

    if (timer !== 'NO' && screen === 'game') {
      setCountdown(parseInt(timer));
    }
  };

  const updateURL = (winnerName) => {
    const url = new URL(window.location);
    url.searchParams.set('winner', winnerName);
    url.searchParams.set('theme', theme);
    url.searchParams.set('mode', mode);
    window.history.pushState({}, '', url);
  };

  const shareResult = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'The Versus Game',
        text: `Mi ${THEMES_DATA[theme].singular} elegid${THEMES_DATA[theme].gender}: ${winner}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('¡Link copiado al portapapeles!');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('¡Link copiado al portapapeles!');
  };

  const playAgain = () => {
    setScreen('setup');
    setSetupStep(0);
    setTheme(null);
    setMode(null);
    setTimer(null);
    setWinner(null);
    setCurrentRound(0);
    setBracket(null);
    setBracketProgress(0);
    window.history.pushState({}, '', window.location.pathname);
  };

  const goHome = () => {
    setScreen('home');
    setTheme(null);
    setMode(null);
    setTimer(null);
    setWinner(null);
    setCurrentRound(0);
    setBracket(null);
    setBracketProgress(0);
    window.history.pushState({}, '', window.location.pathname);
  };

  const goBack = () => {
    if (setupStep > 0) {
      setSetupStep(setupStep - 1);
    } else {
      setScreen('home');
    }
  };

  // HOME SCREEN
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-8 text-yellow-400">
            The Versus Game
          </h1>

          <div className="bg-purple-800 rounded-lg p-6 mb-8 text-lg leading-relaxed">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">¿Cómo jugar?</h2>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Elige un <strong>tema</strong> (Fútbol, Comidas, Series, etc.)</li>
              <li>Selecciona una <strong>modalidad</strong>:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li><strong>Versus 1 a 1:</strong> 10 rondas de enfrentamientos consecutivos</li>
                  <li><strong>Single-Elimination:</strong> Torneo estilo mundial con 16 opciones</li>
                </ul>
              </li>
              <li>Decide si quieres <strong>tiempo límite</strong> (NO, 5 seg, 10 seg)</li>
              <li>¡Comienza a elegir y descubre tu favorito!</li>
            </ol>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-yellow-400 text-purple-900 font-bold text-2xl py-6 rounded-lg hover:bg-yellow-300 transition-colors"
          >
            Comenzar Nuevo Juego
          </button>
        </div>
      </div>
    );
  }

  // SETUP SCREEN
  if (screen === 'setup') {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-yellow-400 mb-6 hover:text-yellow-300 transition-colors"
          >
            <ChevronLeft size={24} />
            Volver
          </button>

          {setupStep === 0 && (
            <div>
              <h2 className="text-4xl font-bold mb-8 text-center">Elige un Tema</h2>
              <div className="grid gap-4">
                {Object.entries(THEMES_DATA).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => selectTheme(key)}
                    className="bg-purple-800 hover:bg-purple-700 p-6 rounded-lg text-2xl font-semibold transition-colors"
                  >
                    {data.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {setupStep === 1 && (
            <div>
              <h2 className="text-4xl font-bold mb-8 text-center">Elige la Modalidad</h2>
              <div className="grid gap-4">
                <button
                  onClick={() => selectMode('1v1')}
                  className="bg-purple-800 hover:bg-purple-700 p-6 rounded-lg transition-colors"
                >
                  <div className="text-2xl font-semibold mb-2">Versus 1 a 1</div>
                  <div className="text-sm opacity-80">10 rondas de enfrentamientos directos</div>
                </button>
                <button
                  onClick={() => selectMode('pyramid')}
                  className="bg-purple-800 hover:bg-purple-700 p-6 rounded-lg transition-colors"
                >
                  <div className="text-2xl font-semibold mb-2">Single-Elimination</div>
                  <div className="text-sm opacity-80">Torneo piramidal con 16 opciones</div>
                </button>
              </div>
            </div>
          )}

          {setupStep === 2 && (
            <div>
              <h2 className="text-4xl font-bold mb-8 text-center">¿Timer por ronda?</h2>
              <div className="grid gap-4">
                <button
                  onClick={() => selectTimer('NO')}
                  className="bg-purple-800 hover:bg-purple-700 p-6 rounded-lg text-2xl font-semibold transition-colors"
                >
                  Sin Timer
                </button>
                <button
                  onClick={() => selectTimer('5')}
                  className="bg-purple-800 hover:bg-purple-700 p-6 rounded-lg text-2xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Clock size={24} />
                  5 segundos
                </button>
                <button
                  onClick={() => selectTimer('10')}
                  className="bg-purple-800 hover:bg-purple-700 p-6 rounded-lg text-2xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Clock size={24} />
                  10 segundos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // GAME SCREEN
  if (screen === 'game') {
    // Para 1v1: layout normal sin fixed
    if (mode === '1v1') {
      return (
        <div className="min-h-screen bg-purple-900 text-white p-4 md:p-6 flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="text-yellow-400 text-xl md:text-2xl mb-4 font-semibold">
                Ronda {currentRound + 1} de 10
              </div>
              {timer !== 'NO' && countdown !== null && (
                <div className="text-8xl md:text-9xl font-bold text-yellow-400 animate-pulse mb-8">
                  {countdown}
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <button
                onClick={() => selectOption(currentOption1)}
                className="w-full md:w-5/12 bg-purple-700 hover:bg-purple-600 p-8 md:p-10 rounded-lg text-2xl md:text-3xl font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                {currentOption1}
              </button>

              <div className="text-4xl md:text-5xl font-bold text-yellow-400">VS</div>

              <button
                onClick={() => selectOption(currentOption2)}
                className="w-full md:w-5/12 bg-purple-700 hover:bg-purple-600 p-8 md:p-10 rounded-lg text-2xl md:text-3xl font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                {currentOption2}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Para pyramid: layout con bracket y botones fixed
    return (
      <div className="min-h-screen bg-purple-900 text-white flex flex-col">
        <div className="flex-1 overflow-y-auto pb-48 md:pb-40">
          <div className="max-w-6xl mx-auto w-full p-4">
            <div className="text-center mb-4">
              <div className="text-yellow-400 text-xl md:text-2xl mb-2 font-semibold">
                {getRoundName()}
              </div>
              {timer !== 'NO' && countdown !== null && (
                <div className="text-7xl md:text-8xl font-bold text-yellow-400 animate-pulse">
                  {countdown}
                </div>
              )}
            </div>

            {bracket && (
              <div className="overflow-x-auto">
                <div className="bg-purple-800 rounded-lg p-2 md:p-4 min-w-max">
                  <BracketDisplay bracket={bracket} progress={bracketProgress} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones fijos al bottom solo para pyramid */}
        <div className="fixed bottom-0 left-0 right-0 bg-purple-900 border-t-2 border-purple-700 p-4 shadow-2xl">
          <div className="max-w-4xl mx-auto flex gap-3 items-center">
            <button
              onClick={() => selectOption(currentOption1)}
              className="flex-1 bg-purple-700 hover:bg-purple-600 p-4 md:p-6 rounded-lg text-lg md:text-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              {currentOption1}
            </button>

            <div className="text-2xl md:text-3xl font-bold text-yellow-400 px-2">VS</div>

            <button
              onClick={() => selectOption(currentOption2)}
              className="flex-1 bg-purple-700 hover:bg-purple-600 p-4 md:p-6 rounded-lg text-lg md:text-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              {currentOption2}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RESULT SCREEN
  if (screen === 'result') {
    const themeData = THEMES_DATA[theme];
    return (
      <div className="min-h-screen bg-purple-900 text-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <Trophy size={80} className="text-yellow-400 mx-auto mb-6" />

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-400">
            ¡Felicitaciones!
          </h2>

          <div className="bg-purple-800 rounded-lg p-8 mb-8">
            <p className="text-xl md:text-2xl mb-4">
              Tu {themeData.singular} elegid{themeData.gender} es:
            </p>
            <p className="text-4xl md:text-6xl font-bold text-yellow-400">
              {winner}
            </p>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={shareResult}
              className="flex-1 bg-yellow-400 text-purple-900 font-bold py-4 rounded-lg hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              Compartir
            </button>
            <button
              onClick={copyLink}
              className="flex-1 bg-yellow-400 text-purple-900 font-bold py-4 rounded-lg hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={20} />
              Copiar Link
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={playAgain}
              className="w-full bg-purple-700 hover:bg-purple-600 font-bold py-4 rounded-lg transition-colors"
            >
              ¿Jugar otra vez?
            </button>
            <button
              onClick={goHome}
              className="w-full bg-purple-800 hover:bg-purple-700 font-bold py-4 rounded-lg transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  function getRoundName() {
    if (bracketProgress < 8) return 'Octavos de Final';
    if (bracketProgress < 12) return 'Cuartos de Final';
    if (bracketProgress < 14) return 'Semifinales';
    return 'Final';
  }

  function BracketDisplay({ bracket, progress }) {
    const getCurrentMatch = () => {
      if (progress < 8) {
        return { round: 'round16', match: progress };
      } else if (progress < 12) {
        return { round: 'round8', match: progress - 8 };
      } else if (progress < 14) {
        return { round: 'round4', match: progress - 12 };
      } else if (progress === 14) {
        return { round: 'round2', match: 0 };
      }
      return null;
    };

    const currentMatch = getCurrentMatch();

    const isCurrentMatch = (round, matchIndex) => {
      if (!currentMatch) return false;
      return currentMatch.round === round && currentMatch.match === matchIndex;
    };

    const getMatchBoxClass = (isCurrent) => {
      const baseClass = "p-1.5 md:p-2 rounded border-2 transition-all text-xs";
      if (isCurrent) {
        return `${baseClass} border-yellow-400 bg-yellow-400 bg-opacity-20 shadow-lg`;
      }
      return `${baseClass} border-white bg-white bg-opacity-10`;
    };

    return (
      <div className="text-[10px] md:text-xs overflow-x-auto pb-2">
        <div className="font-bold text-yellow-400 mb-2 text-center text-sm md:text-base">Bracket del Torneo</div>
        <div className="flex gap-2 md:gap-4 min-w-max justify-start">
          {/* Octavos de Final - 16 jugadores en 8 duelos */}
          <div className="flex flex-col">
            <div className="font-bold mb-1.5 text-yellow-400 text-center text-xs md:text-sm">Octavos</div>
            <div className="space-y-1.5">
              {Array.from({ length: 8 }).map((_, i) => {
                const idx1 = i * 2;
                const idx2 = i * 2 + 1;
                const player1 = bracket.round16[idx1];
                const player2 = bracket.round16[idx2];
                const winner = bracket.round8[i];
                const isCurrent = isCurrentMatch('round16', i);

                return (
                  <div key={i} className={getMatchBoxClass(isCurrent)}>
                    <div className="flex items-center gap-1">
                      <div className={`flex-1 py-0.5 px-1 rounded text-[10px] md:text-xs leading-tight ${winner?.name === player1?.name ? 'bg-green-600 bg-opacity-30 font-bold' : ''}`}>
                        {player1?.name.substring(0, 10) || '???'}
                      </div>
                      <div className="text-yellow-400 font-bold text-[8px] md:text-xs">vs</div>
                      <div className={`flex-1 py-0.5 px-1 rounded text-[10px] md:text-xs leading-tight ${winner?.name === player2?.name ? 'bg-green-600 bg-opacity-30 font-bold' : ''}`}>
                        {player2?.name.substring(0, 10) || '???'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cuartos de Final */}
          <div className="flex flex-col justify-around">
            <div className="font-bold mb-1.5 text-yellow-400 text-center text-xs md:text-sm">Cuartos</div>
            <div className="space-y-6 md:space-y-8">
              {Array.from({ length: 4 }).map((_, i) => {
                const idx1 = i * 2;
                const idx2 = i * 2 + 1;
                const player1 = bracket.round8[idx1];
                const player2 = bracket.round8[idx2];
                const winner = bracket.round4[i];
                const isCurrent = isCurrentMatch('round8', i);

                if (!player1 || !player2) return <div key={i} className="h-12 md:h-16 border border-dashed border-white border-opacity-20 rounded"></div>;

                return (
                  <div key={i} className={getMatchBoxClass(isCurrent)}>
                    <div className="flex items-center gap-1">
                      <div className={`flex-1 py-0.5 px-1 rounded text-[10px] md:text-xs leading-tight ${winner?.name === player1.name ? 'bg-green-600 bg-opacity-30 font-bold' : ''}`}>
                        {player1.name.substring(0, 10)}
                      </div>
                      <div className="text-yellow-400 font-bold text-[8px] md:text-xs">vs</div>
                      <div className={`flex-1 py-0.5 px-1 rounded text-[10px] md:text-xs leading-tight ${winner?.name === player2.name ? 'bg-green-600 bg-opacity-30 font-bold' : ''}`}>
                        {player2.name.substring(0, 10)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Semifinales */}
          <div className="flex flex-col justify-around">
            <div className="font-bold mb-1.5 text-yellow-400 text-center text-xs md:text-sm">Semis</div>
            <div className="space-y-12 md:space-y-16">
              {Array.from({ length: 2 }).map((_, i) => {
                const idx1 = i * 2;
                const idx2 = i * 2 + 1;
                const player1 = bracket.round4[idx1];
                const player2 = bracket.round4[idx2];
                const winner = bracket.round2[i];
                const isCurrent = isCurrentMatch('round4', i);

                if (!player1 || !player2) return <div key={i} className="h-12 md:h-16 border border-dashed border-white border-opacity-20 rounded"></div>;

                return (
                  <div key={i} className={getMatchBoxClass(isCurrent)}>
                    <div className="flex items-center gap-1">
                      <div className={`flex-1 py-0.5 px-1 rounded text-[10px] md:text-xs leading-tight ${winner?.name === player1.name ? 'bg-green-600 bg-opacity-30 font-bold' : ''}`}>
                        {player1.name.substring(0, 10)}
                      </div>
                      <div className="text-yellow-400 font-bold text-[8px] md:text-xs">vs</div>
                      <div className={`flex-1 py-0.5 px-1 rounded text-[10px] md:text-xs leading-tight ${winner?.name === player2.name ? 'bg-green-600 bg-opacity-30 font-bold' : ''}`}>
                        {player2.name.substring(0, 10)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final */}
          <div className="flex flex-col justify-center">
            <div className="font-bold mb-1.5 text-yellow-400 text-center text-xs md:text-sm">Final</div>
            {bracket.round2[0] && bracket.round2[1] ? (
              <div className={getMatchBoxClass(isCurrentMatch('round2', 0))}>
                <div className="flex items-center gap-1">
                  <div className={`flex-1 py-0.5 px-1 rounded text-[10px] md:text-xs leading-tight ${bracket.final === bracket.round2[0].name ? 'bg-green-600 bg-opacity-30 font-bold' : ''}`}>
                    {bracket.round2[0].name.substring(0, 10)}
                  </div>
                  <div className="text-yellow-400 font-bold text-[8px] md:text-xs">vs</div>
                  <div className={`flex-1 py-0.5 px-1 rounded text-[10px] md:text-xs leading-tight ${bracket.final === bracket.round2[1].name ? 'bg-green-600 bg-opacity-30 font-bold' : ''}`}>
                    {bracket.round2[1].name.substring(0, 10)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-12 md:h-16 border border-dashed border-white border-opacity-20 rounded flex items-center justify-center text-white text-opacity-50 text-xs">
                -
              </div>
            )}
          </div>

          {/* Campeón */}
          <div className="flex flex-col justify-center">
            <div className="font-bold mb-1.5 text-yellow-400 text-center text-xs md:text-sm">🏆</div>
            {bracket.final ? (
              <div className="border-2 border-yellow-400 bg-yellow-400 bg-opacity-30 p-2 md:p-3 rounded text-center shadow-xl">
                <div className="text-lg md:text-2xl mb-1">🏆</div>
                <div className="text-[10px] md:text-xs font-bold text-yellow-400 leading-tight">{bracket.final.substring(0, 10)}</div>
              </div>
            ) : (
              <div className="h-12 md:h-16 border border-dashed border-yellow-400 border-opacity-30 rounded flex items-center justify-center">
                <div className="text-yellow-400 text-opacity-50 text-lg">?</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default VersusGame;