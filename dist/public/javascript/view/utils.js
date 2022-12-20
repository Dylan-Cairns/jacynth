var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// class to handle the main menu on all pages
export class MainMenuHandler {
    constructor(startVisible) {
        var _a;
        this.menuButton = document.getElementById('menuButton');
        this.closeMenuButton = document.getElementById('closeMenuButton');
        this.menu = document.getElementById('menu-popup');
        this.rulesButton = document.getElementById('rulesButton');
        this.closeRulesButton = document.getElementById('closeRulesButton');
        this.scoresButton = document.getElementById('scoresButton');
        this.closeScoresButton = document.getElementById('closeScoresButton');
        this.rules = document.getElementById('rules');
        this.scores = document.getElementById('scores');
        this.overlay = document.getElementById('overlay');
        this.newGameButton = document.getElementById('newGameBttn');
        // menu modals and buttons
        if (this.menuButton) {
            this.menuButton.addEventListener('click', () => {
                this.openModal(this.menu);
            });
        }
        if (this.closeMenuButton) {
            this.closeMenuButton.addEventListener('click', () => {
                this.closeModal(this.menu);
            });
        }
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach((modal) => {
                    this.closeModal(modal);
                });
            });
        }
        this.rulesButton.addEventListener('click', () => {
            this.openModal(this.rules);
        });
        this.closeRulesButton.addEventListener('click', () => {
            this.rules.classList.remove('active');
        });
        this.rules.addEventListener('click', (event) => {
            if (event.target === this.rules) {
                this.rules.classList.remove('active');
            }
        });
        this.scoresButton &&
            this.scoresButton.addEventListener('click', () => {
                this.openModal(this.scores);
            });
        this.closeScoresButton &&
            this.closeScoresButton.addEventListener('click', () => {
                this.scores.classList.remove('active');
            });
        this.scores &&
            this.scores.addEventListener('click', (event) => {
                if (event.target === this.scores) {
                    this.scores.classList.remove('active');
                }
            });
        this.newGameButton.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('layout');
            location.href = this.newGameButton.href;
        });
        if (startVisible) {
            this.menu.classList.add('active');
        }
        // remove 'resume game' button if there is no stored game info,
        if (!localStorage.getItem('layout')) {
            (_a = document.getElementById('singlePlayerResumeBttn')) === null || _a === void 0 ? void 0 : _a.remove();
        }
    }
    openModal(modal) {
        if (modal == null)
            return;
        modal.classList.add('active');
        if (this.overlay)
            this.overlay.classList.add('active');
    }
    closeModal(modal) {
        if (modal == null)
            return;
        modal.classList.remove('active');
        if (this.overlay)
            this.overlay.classList.remove('active');
    }
}
export class TabsHandler {
    constructor() {
        const tabs = document.querySelectorAll('[data-tab-target]');
        const tabContents = document.querySelectorAll('[data-tab-content]');
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const target = document.querySelector(tab.dataset.tabTarget);
                tabContents.forEach((tabContent) => {
                    tabContent.classList.remove('active');
                });
                tabs.forEach((tab) => {
                    tab.classList.remove('active');
                });
                tab.classList.add('active');
                target.classList.add('active');
            });
        });
    }
}
// method to create tables from scores data on profile and high scores pages
export function populateTable(items, tableName) {
    const table = document.getElementById(tableName);
    const tBody = table.getElementsByTagName('tbody')[0];
    if (!table.tHead) {
        const header = table.createTHead();
        const tr = header.insertRow(0);
        Object.keys(items[0]).forEach((key) => {
            const th = document.createElement('th');
            th.innerHTML = key;
            tr.appendChild(th);
        });
    }
    items.forEach((item) => {
        const row = tBody.insertRow();
        Object.keys(item).forEach((key) => {
            const newRow = row.insertCell();
            // reformat ugly dates
            if (key === 'Date') {
                const date = new Date(item[key]);
                const string = convertDate(date);
                newRow.innerHTML = string;
            }
            else {
                newRow.innerHTML = item[key];
            }
            newRow.setAttribute('data-label', key);
        });
    });
}
function convertDate(dateObj) {
    const month = dateObj.getUTCMonth() + 1; //months from 1-12
    const day = dateObj.getUTCDate();
    const year = dateObj.getUTCFullYear();
    const newDate = year + '/' + month + '/' + day;
    return newDate;
}
export class ScoresHandler {
    constructor() {
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
    }
}
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
export class NickNameFormHandler {
    constructor(visible, showCancelButton) {
        var _a;
        const container = document.getElementById('nickNameFormContainer');
        if (visible)
            container.classList.add('active');
        // edit nick button is only used on profile page
        const editNickButton = document.getElementById('editNickBttn');
        if (editNickButton) {
            editNickButton.addEventListener('click', (event) => {
                event.preventDefault();
                resultDiv.innerHTML = '';
                resultDiv.classList.remove('error', 'success', 'active');
                container.classList.add('active');
            });
        }
        const submitButton = document.getElementById('nickSubmitButton');
        const cancelButton = document.getElementById('cancelBttn');
        const resultDiv = document.getElementById('resultDiv');
        if (showCancelButton) {
            cancelButton.addEventListener('click', (event) => {
                event.preventDefault();
                container.classList.remove('active');
                resultDiv.innerHTML = '';
                resultDiv.classList.remove('error', 'success', 'active');
            });
        }
        else {
            (_a = document.getElementById('cancelButton')) === null || _a === void 0 ? void 0 : _a.remove();
        }
        submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            resultDiv.innerHTML = '';
            resultDiv.classList.remove('error', 'success', 'active');
            const nickField = document.getElementById('nickTextField');
            const nickname = nickField.value;
            const data = { nickname: nickname };
            (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield fetch('/rest/storeUserNick', {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: 'post',
                        body: JSON.stringify(data)
                    })
                        .then(function (response) {
                        console.log(response);
                        if (response.ok) {
                            resultDiv.innerHTML = 'OK!';
                            resultDiv.classList.add('success', 'active');
                            const nickDiv = document.getElementById('nickname');
                            if (nickDiv)
                                nickDiv.innerHTML = nickname;
                            setTimeout(() => container.classList.remove('active'), 1000);
                        }
                        else {
                            return response.json();
                        }
                    })
                        .then(function (data) {
                        if (data && data.errors) {
                            console.log(data);
                            setTimeout(() => {
                                resultDiv.classList.add('error', 'active');
                                resultDiv.innerHTML = data.errors[0].msg;
                            }, 200);
                        }
                    });
                }
                catch (error) {
                    console.log('error', error);
                }
            }))();
        });
    }
}
