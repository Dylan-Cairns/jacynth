import { MainMenuHandler, populateTable } from './view/utils.js';
const mainMenuHandler = new MainMenuHandler(false);
const savedScores = localStorage.getItem('scoresHistory');
const SPgameData = savedScores ? JSON.parse(savedScores) : [];
if (SPgameData.length > 0) {
    // create sp game data table
    populateTable(SPgameData, 'SPGameRecords');
}
document.getElementById('spinner').style.visibility = 'hidden';
document.getElementById('loadScreen').classList.remove('active');
