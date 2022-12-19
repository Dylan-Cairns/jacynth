declare class Plotly {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(data: any);
  static newPlot(arg0: string, data: any, layout: any, config: any): any;
}

// class to handle the main menu on all pages
export class MainMenuHandler {
  menuButton: HTMLButtonElement | undefined;
  closeMenuButton: HTMLButtonElement | undefined;
  menu: HTMLElement;
  rulesButton: HTMLButtonElement;
  closeRulesButton: HTMLButtonElement;
  scoresButton: HTMLButtonElement;
  closeScoresButton: HTMLButtonElement;
  rules: HTMLElement;
  scores: HTMLElement;
  overlay: HTMLElement | undefined;
  newGameButton: HTMLAnchorElement;
  constructor(startVisible: boolean) {
    this.menuButton = document.getElementById('menuButton') as
      | HTMLButtonElement
      | undefined;
    this.closeMenuButton = document.getElementById('closeMenuButton') as
      | HTMLButtonElement
      | undefined;
    this.menu = document.getElementById('menu-popup') as HTMLElement;
    this.rulesButton = document.getElementById(
      'rulesButton'
    ) as HTMLButtonElement;
    this.closeRulesButton = document.getElementById(
      'closeRulesButton'
    ) as HTMLButtonElement;
    this.scoresButton = document.getElementById(
      'scoresButton'
    ) as HTMLButtonElement;
    this.closeScoresButton = document.getElementById(
      'closeScoresButton'
    ) as HTMLButtonElement;
    this.rules = document.getElementById('rules') as HTMLElement;
    this.scores = document.getElementById('scores') as HTMLElement;
    this.overlay = document.getElementById('overlay') as
      | HTMLElement
      | undefined;
    this.newGameButton = document.getElementById(
      'newGameBttn'
    ) as HTMLAnchorElement;

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
      document.getElementById('singlePlayerResumeBttn')?.remove();
    }
  }

  public openModal(modal: Element | HTMLElement | undefined) {
    if (modal == null) return;
    modal.classList.add('active');
    if (this.overlay) this.overlay.classList.add('active');
  }

  public closeModal(modal: Element | HTMLElement | undefined) {
    if (modal == null) return;
    modal.classList.remove('active');
    if (this.overlay) this.overlay.classList.remove('active');
  }
}

export class TabsHandler {
  constructor() {
    const tabs = document.querySelectorAll(
      '[data-tab-target]'
    ) as NodeListOf<HTMLElement>;
    const tabContents = document.querySelectorAll('[data-tab-content]');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.tabTarget!)!;
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
export function populateTable(
  items: [Record<string, string>],
  tableName: string
) {
  const table = document.getElementById(tableName) as HTMLTableElement;
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

  items.forEach((item: Record<string, string>) => {
    const row = tBody.insertRow();
    Object.keys(item).forEach((key) => {
      const newRow = row.insertCell();
      // reformat ugly dates
      if (key === 'Date') {
        const date = new Date(item[key]);
        const string = convertDate(date);
        newRow.innerHTML = string;
      } else {
        newRow.innerHTML = item[key];
      }
      newRow.setAttribute('data-label', key);
    });
  });
}

function convertDate(dateObj: Date) {
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
      if (spHighScoreDiv) spHighScoreDiv.innerHTML += spHighScore;

      const spWinningStreak = getWinningStreak(SPgameData);
      const spStreakDiv = document.getElementById('spStreak');
      if (spStreakDiv) spStreakDiv.innerHTML += spWinningStreak;

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
      ] as any;

      const pieChartLayout = {
        title: 'Wins/Losses',
        showlegend: false
      };

      const pieChartConfig = { responsive: true };

      Plotly.newPlot(
        'spPieChart',
        pieChartData,
        pieChartLayout,
        pieChartConfig
      );

      const spPlayerScores = [] as number[];
      const spOpponentScores = [] as number[];
      const spGameNumber = [] as number[];
      SPgameData.forEach((row: any) => {
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

      Plotly.newPlot(
        'spPieChart2',
        data,
        {
          title: 'Scores',
          xaxis: { title: 'Game #' },
          yaxis: {
            title: 'Points'
          },
          barmode: 'group'
        },
        { responsive: true }
      );
    }
  }
}

function getHighScore(records: Record<string, number>[]) {
  return records.reduce((acc: number, row: Record<string, number>) => {
    acc = row['Your Score'] > acc ? row['Your Score'] : acc;
    return acc;
  }, 0);
}

function getWinningStreak(records: Record<string, string>[]) {
  let winningStreak = 0;
  let localSum = 0;

  for (let idx = 0; idx < records.length; idx++) {
    if (records[idx]['Result'] === 'Won') {
      localSum++;
    } else {
      localSum = 0;
    }
    winningStreak = localSum > winningStreak ? localSum : winningStreak;
  }

  return winningStreak;
}

function getWinsLosses(records: any): Map<string, number> {
  return records.reduce(
    (acc: Record<string, number>, ele: Record<string, string>) => {
      acc[ele['Result']] = acc[ele['Result']] ? acc[ele['Result']] + 1 : 1;
      return acc;
    },
    new Map()
  );
}

export class NickNameFormHandler {
  constructor(visible: boolean, showCancelButton: boolean) {
    const container = document.getElementById(
      'nickNameFormContainer'
    ) as HTMLElement;
    if (visible) container.classList.add('active');

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

    const submitButton = document.getElementById(
      'nickSubmitButton'
    ) as HTMLButtonElement;

    const cancelButton = document.getElementById(
      'cancelBttn'
    ) as HTMLButtonElement;

    const resultDiv = document.getElementById('resultDiv') as HTMLElement;

    if (showCancelButton) {
      cancelButton.addEventListener('click', (event) => {
        event.preventDefault();
        container.classList.remove('active');
        resultDiv.innerHTML = '';
        resultDiv.classList.remove('error', 'success', 'active');
      });
    } else {
      document.getElementById('cancelButton')?.remove();
    }

    submitButton.addEventListener('click', (event) => {
      event.preventDefault();
      resultDiv.innerHTML = '';
      resultDiv.classList.remove('error', 'success', 'active');

      const nickField = document.getElementById(
        'nickTextField'
      ) as HTMLTextAreaElement;
      const nickname = nickField.value;
      const data = { nickname: nickname };

      (async () => {
        try {
          const response = await fetch('/rest/storeUserNick', {
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
                if (nickDiv) nickDiv.innerHTML = nickname;
                setTimeout(() => container.classList.remove('active'), 1000);
              } else {
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
        } catch (error) {
          console.log('error', error);
        }
      })();
    });
  }
}
