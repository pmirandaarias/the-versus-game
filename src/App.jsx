import React, { useState, useEffect } from 'react';
import { Share2, Copy, ChevronLeft, Trophy, Clock } from 'lucide-react';

// Datos de temas (50 opciones cada uno)
const THEMES_DATA = {
  nba: {
    name: 'Jugadores de NBA',
    singular: 'jugador de NBA',
    gender: 'o',
    items: [
      'Michael Jordan', 'LeBron James', 'Kobe Bryant', 'Magic Johnson', 'Larry Bird',
      'Kareem Abdul-Jabbar', 'Tim Duncan', 'Shaquille O\'Neal', 'Wilt Chamberlain', 'Bill Russell',
      'Stephen Curry', 'Kevin Durant', 'Hakeem Olajuwon', 'Oscar Robertson', 'Jerry West',
      'Julius Erving', 'Moses Malone', 'Dirk Nowitzki', 'Karl Malone', 'Charles Barkley',
      'John Stockton', 'Scottie Pippen', 'Dwyane Wade', 'Kevin Garnett', 'Allen Iverson',
      'Steve Nash', 'Jason Kidd', 'Chris Paul', 'Clyde Drexler', 'David Robinson',
      'Patrick Ewing', 'Isiah Thomas', 'Ray Allen', 'Reggie Miller', 'Paul Pierce',
      'Kawhi Leonard', 'Giannis Antetokounmpo', 'Nikola Jokic', 'Luka Doncic', 'Damian Lillard',
      'James Harden', 'Russell Westbrook', 'Anthony Davis', 'Carmelo Anthony', 'Pau Gasol',
      'Tony Parker', 'Manu Ginobili', 'Vince Carter', 'Tracy McGrady', 'Yao Ming'
    ]
  },
  soccer: {
    name: 'Jugadores de Fútbol',
    singular: 'jugador de fútbol',
    gender: 'o',
    items: [
      'Lionel Messi', 'Cristiano Ronaldo', 'Pelé', 'Diego Maradona', 'Johan Cruyff',
      'Zinedine Zidane', 'Ronaldo Nazário', 'Ronaldinho', 'Franz Beckenbauer', 'Alfredo Di Stéfano',
      'Michel Platini', 'Marco van Basten', 'George Best', 'Bobby Charlton', 'Lev Yashin',
      'Gerd Müller', 'Paolo Maldini', 'Franco Baresi', 'Lothar Matthäus', 'Roberto Baggio',
      'Romário', 'Rivaldo', 'Thierry Henry', 'Andrés Iniesta', 'Xavi Hernández',
      'Neymar Jr', 'Kylian Mbappé', 'Erling Haaland', 'Robert Lewandowski', 'Karim Benzema',
      'Luka Modrić', 'Kevin De Bruyne', 'Mohamed Salah', 'Sergio Ramos', 'Virgil van Dijk',
      'Manuel Neuer', 'Gianluigi Buffon', 'Iker Casillas', 'Luis Suárez', 'Sergio Agüero',
      'Zlatan Ibrahimović', 'Wayne Rooney', 'Frank Lampard', 'Steven Gerrard', 'Andrea Pirlo',
      'Gareth Bale', 'Eden Hazard', 'Sadio Mané', 'Harry Kane', 'Son Heung-min'
    ]
  },
  food: {
    name: 'Comidas Típicas',
    singular: 'comida',
    gender: 'a',
    items: [
      'Pizza', 'Sushi', 'Tacos', 'Hamburguesa', 'Pasta Carbonara',
      'Paella', 'Pad Thai', 'Ramen', 'Pho', 'Curry Indio',
      'Asado Argentino', 'Ceviche', 'Empanadas', 'Fish and Chips', 'Croissant',
      'Falafel', 'Kebab', 'Lasaña', 'Risotto', 'Gyoza',
      'Dim Sum', 'Peking Duck', 'Biryani', 'Shawarma', 'Moussaka',
      'Borscht', 'Goulash', 'Pierogi', 'Schnitzel', 'Bratwurst',
      'Churros', 'Tiramisú', 'Baklava', 'Bibimbap', 'Kimchi',
      'Poutine', 'Nachos', 'Quesadilla', 'Burrito', 'Enchiladas',
      'Sashimi', 'Tempura', 'Udon', 'Bulgogi', 'Tom Yum',
      'Satay', 'Rendang', 'Nasi Goreng', 'Laksa', 'Pho'
    ]
  },
  series: {
    name: 'Series de TV',
    singular: 'serie',
    gender: 'a',
    items: [
      'Breaking Bad', 'Game of Thrones', 'The Sopranos', 'The Wire', 'Friends',
      'The Office', 'Stranger Things', 'The Crown', 'Sherlock', 'Black Mirror',
      'Westworld', 'True Detective', 'Mad Men', 'Lost', 'The Walking Dead',
      'Dexter', 'House of Cards', 'Narcos', 'Peaky Blinders', 'Money Heist',
      'Dark', 'Chernobyl', 'Band of Brothers', 'The Mandalorian', 'The Witcher',
      'Vikings', 'Better Call Saul', 'Fargo', 'Twin Peaks', 'The X-Files',
      'Seinfeld', 'Curb Your Enthusiasm', 'Parks and Recreation', 'Brooklyn Nine-Nine', 'Community',
      'Rick and Morty', 'BoJack Horseman', 'Arcane', 'The Last of Us', 'Succession',
      'The Boys', 'Invincible', 'Fleabag', 'The Handmaid\'s Tale', 'Ozark',
      'Mindhunter', 'Squid Game', 'Wednesday', 'The Bear', 'Severance'
    ]
  }
};

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
      initPyramid();
    } else {
      initOneVsOne();
    }
    setScreen('game');
  };

  const initOneVsOne = () => {
    setCurrentRound(0);
    setUsedItems([]);
    const item1 = selectedItems[Math.floor(Math.random() * selectedItems.length)];
    const available = selectedItems.filter(i => i !== item1);
    const item2 = available[Math.floor(Math.random() * available.length)];
    setCurrentOption1(item1);
    setCurrentOption2(item2);
    if (timer !== 'NO') {
      setCountdown(parseInt(timer));
    }
  };

  const initPyramid = () => {
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
    if (timer !== 'NO') {
      setCountdown(parseInt(timer));
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
      if (!newBracket.round8[matchIndex]) {
        newBracket.round8[matchIndex] = { name: option, winner: null };
      }

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
      const quarterIndex = bracketProgress - 8;
      if (!newBracket.round4[quarterIndex]) {
        newBracket.round4[quarterIndex] = { name: option, winner: null };
      }

      if (bracketProgress < 11) {
        const nextQuarter = quarterIndex + 1;
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
      const semiIndex = bracketProgress - 12;
      if (!newBracket.round2[semiIndex]) {
        newBracket.round2[semiIndex] = { name: option, winner: null };
      }

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
              <li>Elige un <strong>tema</strong> (NBA, Fútbol, Comidas, Series)</li>
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
    return (
      <div className="min-h-screen bg-purple-900 text-white p-6 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="text-center mb-6">
            <div className="text-yellow-400 text-lg mb-2">
              {mode === '1v1' ? `Ronda ${currentRound + 1} de 10` : getRoundName()}
            </div>
            {timer !== 'NO' && countdown !== null && (
              <div className="text-6xl font-bold text-yellow-400 animate-pulse">
                {countdown}
              </div>
            )}
          </div>

          {mode === 'pyramid' && bracket && (
            <div className="mb-6 overflow-x-auto">
              <div className="bg-purple-800 rounded-lg p-4 min-w-max">
                <BracketDisplay bracket={bracket} progress={bracketProgress} />
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col md:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => selectOption(currentOption1)}
              className="w-full md:w-1/2 bg-purple-700 hover:bg-purple-600 p-8 rounded-lg text-2xl md:text-3xl font-bold transition-all transform hover:scale-105"
            >
              {currentOption1}
            </button>

            <div className="text-4xl font-bold text-yellow-400">VS</div>

            <button
              onClick={() => selectOption(currentOption2)}
              className="w-full md:w-1/2 bg-purple-700 hover:bg-purple-600 p-8 rounded-lg text-2xl md:text-3xl font-bold transition-all transform hover:scale-105"
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
    return (
      <div className="text-xs md:text-sm">
        <div className="font-bold text-yellow-400 mb-2">Bracket del Torneo</div>
        <div className="flex gap-2 justify-between">
          <div>
            <div className="font-semibold mb-1">Octavos</div>
            {bracket.round16.slice(0, 8).map((item, i) => (
              <div key={i} className={`py-1 ${progress > i / 2 ? 'opacity-50' : ''}`}>
                {item.name.substring(0, 15)}
              </div>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-1">Cuartos</div>
            {bracket.round8.map((item, i) => (
              <div key={i} className="py-2">
                {item.name.substring(0, 15)}
              </div>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-1">Semis</div>
            {bracket.round4.map((item, i) => (
              <div key={i} className="py-4">
                {item.name.substring(0, 15)}
              </div>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-1">Final</div>
            {bracket.round2.map((item, i) => (
              <div key={i} className="py-8">
                {item.name.substring(0, 15)}
              </div>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-1">Campeón</div>
            {bracket.final && (
              <div className="py-16 text-yellow-400 font-bold">
                {bracket.final.substring(0, 15)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default VersusGame;