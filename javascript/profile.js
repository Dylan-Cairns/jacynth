import { populateTable } from './view/utils.js';
const savedScores = localStorage.getItem('scoresHistory');
const SPgameData = savedScores ? JSON.parse(savedScores) : [];
if (SPgameData.length > 0) {
    // create sp game data table
    populateTable(SPgameData, 'SPGameRecords');
    const spHighScore = getHighScore(SPgameData);
    const spHighScoreDiv = document.getElementById('spHighScore');
    if (spHighScoreDiv)
        spHighScoreDiv.innerHTML += spHighScore;
    const spWinningStreak = getWinningStreak(SPgameData);
    const spStreakDiv = document.getElementById('spStreak');
    if (spStreakDiv)
        spStreakDiv.innerHTML += spWinningStreak;
    const winsLosses = getWinsLosses(SPgameData);
    const pieChartLabels = Object.keys(winsLosses);
    const pieChartValues = Object.values(winsLosses);
    const pieChartData = [
        {
            type: 'pie',
            values: pieChartValues,
            labels: pieChartLabels,
            textinfo: 'label+percent',
            insidetextorientation: 'radial',
            automargin: true,
            marker: {
                colors: [
                    'rgb(56, 75, 126)',
                    'rgb(18, 36, 37)',
                    'rgb(34, 53, 101)',
                    'rgb(36, 55, 57)',
                    'rgb(6, 4, 4)'
                ]
            }
        }
    ];
    const pieChartLayout = {
        title: 'Wins/Losses',
        showlegend: false
    };
    const pieChartConfig = { responsive: true };
    Plotly.newPlot('spPieChart', pieChartData, pieChartLayout, pieChartConfig);
    const spPlayerScores = [];
    const spOpponentScores = [];
    const spGameNumber = [];
    SPgameData.forEach((row) => {
        spPlayerScores.push(row['Your Score']);
        spOpponentScores.push(row['Opponent Score']);
        spGameNumber.push(row['#']);
    });
    const trace1 = {
        x: spGameNumber,
        y: spPlayerScores,
        name: 'You',
        type: 'bar'
    };
    const trace2 = {
        x: spGameNumber,
        y: spOpponentScores,
        name: 'Opponent',
        type: 'bar'
    };
    const data = [trace1, trace2];
    Plotly.newPlot('spPieChart2', data, {
        title: 'Scores',
        xaxis: { title: 'Game #' },
        yaxis: {
            title: 'Points'
        },
        barmode: 'group'
    }, { responsive: true });
}
// Remove active class from multiplayer grid container to set it's display to none.
// Initially loading the page without the active class will cause plotly
// To render the charts at an incorrect size.
// remove load screen after data finished loading
document.getElementById('spinner').style.visibility = 'hidden';
document.getElementById('loadScreen').classList.remove('active');
function getHighScore(records) {
    return records.reduce((acc, row) => {
        acc = row['Your Score'] > acc ? row['Your Score'] : acc;
        return acc;
    }, 0);
}
function getWinningStreak(records) {
    let winningStreak = 0;
    let localSum = 0;
    for (let idx = 0; idx < records.length; idx++) {
        if (records[idx]['Result'] === 'Won') {
            localSum++;
        }
        else {
            localSum = 0;
        }
        winningStreak = localSum > winningStreak ? localSum : winningStreak;
    }
    return winningStreak;
}
function getWinsLosses(records) {
    return records.reduce((acc, ele) => {
        acc[ele['Result']] = acc[ele['Result']] ? acc[ele['Result']] + 1 : 1;
        return acc;
    }, new Map());
}
