import "./App.css";
import React from 'react';
// import BN from 'bn.js';
import * as nearAPI from 'near-api-js'
import { HuePicker, GithubPicker } from 'react-color'

const MasterPrivateKey = 'ed25519:N8BWV6ZKpFa161b2T8WoyGzNauLc9PSoLtzK53rjiPgAYUB1C45xh9jDzqcRsKdKTvjZM2Hn7t2yvbBVwbhkvHv';

// const OneNear = new BN("1000000000000000000000000");
const ContractName = 'unlimited-place.meta';
const BoardHeight = 50;
const BoardWidth = 50;
const NumLinesPerFetch = 10;
const ExpectedLineLength = 4 + 4 * BoardWidth;
const CellWidth = 16;
const CellHeight = 16;
const MaxNumColors = 31;
const BatchOfPixels = 200;
// 500 ms
const BatchTimeout = 500;
const RefreshBoardTimeout = 1000;
const MaxWorkTime = 10 * 60 * 1000;

const intToColor = (c) => `#${c.toString(16).padStart(6, '0')}`;
const transparentColor = (c, a) => `rgba(${(c >> 16) / 1}, ${((c >> 8) & 0xff) / 1}, ${(c & 0xff) / 1}, ${a})`
const generateGamma = (hue) => {
  const gammaColors = [];
  for (let i = 0; i < MaxNumColors; ++i) {
    gammaColors.push(`hsl(${hue}, 100%, ${100 * i / (MaxNumColors - 1)}%)`);
  }
  return gammaColors;
};
const decodeLine = (line) => {
  let buf = Buffer.from(line, 'base64');
  if (buf.length !== ExpectedLineLength) {
    throw new Error("Unexpected encoded line length");
  }
  let pixels = []
  for (let i = 4; i < buf.length; i += 4) {
    let color = buf.readUInt32LE(i);
    pixels.push({
      color,
    })
  }
  return pixels;
};

class App extends React.Component {
  constructor(props) {
    super(props);

    const colors = ["#000000", "#666666", "#aaaaaa", "#FFFFFF", "#F44E3B", "#D33115", "#9F0500", "#FE9200", "#E27300", "#C45100", "#FCDC00", "#FCC400", "#FB9E00", "#DBDF00", "#B0BC00", "#808900", "#A4DD00", "#68BC00", "#194D33", "#68CCCA", "#16A5A5", "#0C797D", "#73D8FF", "#009CE0", "#0062B1", "#AEA1FF", "#7B64FF", "#653294", "#FDA1FF", "#FA28FF", "#AB149E"].map((c) => c.toLowerCase());
    const currentColor = parseInt(colors[Math.floor(Math.random() * colors.length)].substring(1), 16);

    this.state = {
      failedToInitialize: false,
      connected: false,
      boardLoaded: false,
      selectedCell: null,
      currentColor,
      pickerColor: intToColor(currentColor),
      colors,
      gammaColors: generateGamma(0),
      pickingColor: false,
    };

    this.canvasRef = React.createRef();
    this._context = false;
    this._lines = false;
    this._queue = [];
    this._pendingPixels = [];
    this._refreshBoardTimer = null;
    this._sendQueueTimer = null;
    this._stopRefreshTime = new Date().getTime() + MaxWorkTime;

    this._initNear().then(() => {
      this.setState({
        connected: true,
      });
    });
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    this._context = canvas.getContext('2d');

    canvas.addEventListener('mousemove', (e) => {
      const x = Math.trunc(e.offsetX / e.target.clientWidth * BoardWidth);
      const y = Math.trunc(e.offsetY / e.target.clientHeight * BoardWidth);
      let cell = null;
      if (x >= 0 && x < BoardWidth && y >= 0 && y < BoardHeight) {
        cell = { x, y };
      }
      if (JSON.stringify(cell) !== JSON.stringify(this.state.selectedCell)) {
        this.setState({
          selectedCell: cell,
        }, async () => {
          this.renderCanvas()
          if (this.state.selectedCell !== null && (e.buttons & 1) > 0) {
            if (this.state.pickingColor) {
              this.pickColor(this.state.selectedCell);
            } else {
              this.saveColor();
              await this.drawPixel(this.state.selectedCell);
            }
          }
        })
      }
    });

    canvas.addEventListener('click', async (e) => {
      if (this.state.selectedCell !== null) {
        if (this.state.pickingColor) {
          this.pickColor(this.state.selectedCell);
        } else {
          this.saveColor();
          await this.drawPixel(this.state.selectedCell);
        }
      }
    });


    document.addEventListener('keydown', (e) => {
      e.altKey && this.setState({
        pickingColor: true,
      }, () => {
        this.renderCanvas()
      });
    })
    document.addEventListener('keyup', (e) => {
      !e.altKey && this.setState({
        pickingColor: false,
      }, () => {
        this.renderCanvas()
      });
    })
  }

  pickColor(cell) {
    if (!this._lines || !this._lines[cell.y]) {
      return;
    }
    const color = this._lines[cell.y][cell.x].color;

    this.setState({
      currentColor: color,
      pickingColor: false,
    }, () => {
      this.renderCanvas()
    });
  }

  async _sendQueue() {
    const pixels = this._queue.slice(0, BatchOfPixels);
    this._queue = this._queue.slice(BatchOfPixels);
    this._pendingPixels = pixels;

    try {
      await this._contract.draw({
        pixels
      });
      await this.refreshBoard(true);
    } catch (error) {
      console.log("Failed to send a transaction", error);
      this._queue = this._queue.concat(this._pendingPixels);
    }
    this._pendingPixels = [];
  }

  async _pingQueue(ready) {
    if (this._sendQueueTimer) {
      clearTimeout(this._sendQueueTimer);
      this._sendQueueTimer = null;
    }

    if (this._pendingPixels.length === 0 && (this._queue.length >= BatchOfPixels || ready)) {
      await this._sendQueue();
    }
    if (this._queue.length > 0) {
      this._sendQueueTimer = setTimeout(async () => {
        await this._pingQueue(true);
      }, BatchTimeout);
    }

  }

  async drawPixel(cell) {
    if (!this.state.connected || this.state.failedToInitialize || !this._lines || !this._lines[cell.y]) {
      return;
    }

    if (this._lines[cell.y][cell.x].color !== this.state.currentColor) {
      this._lines[cell.y][cell.x].color = this.state.currentColor;
    } else {
      return;
    }

    this._queue.push({
      x: cell.x,
      y: cell.y,
      color: this.state.currentColor,
    });

    this._stopRefreshTime = new Date().getTime() + MaxWorkTime;
    await this._pingQueue(false);
  }

  async initKey() {
    let key = await this._keyStore.getKey(this._nearConfig.networkId, ContractName);
    if (!key) {
      const keyPair = nearAPI.KeyPair.fromString(MasterPrivateKey);
      await this._keyStore.setKey(this._nearConfig.networkId, ContractName, keyPair);
      const account = new nearAPI.Account(this._near.connection, ContractName);
      this._contract = new nearAPI.Contract(account, ContractName, {
        viewMethods: [],
        changeMethods: ['add_access_key'],
        sender: ContractName,
      });
      const newKeyPair = nearAPI.KeyPair.fromRandom('ED25519');
      try {
        await this._contract.add_access_key({
          public_key: newKeyPair.getPublicKey().toString()
        });
        await this._keyStore.setKey(this._nearConfig.networkId, ContractName, newKeyPair);
      } catch (err) {
        await this._keyStore.removeKey(this._nearConfig.networkId, ContractName);
        this._contract = null;
        this.setState({
          failedToInitialize: true,
        });
        return;
      }
    }
    const account = new nearAPI.Account(this._near.connection, ContractName);
    this._contract = new nearAPI.Contract(account, ContractName, {
      viewMethods: ['get_lines', 'get_line_versions'],
      changeMethods: ['draw'],
      sender: ContractName,
    });
  }

  async _initNear() {
    const nearConfig = {
      networkId: 'default',
      nodeUrl: 'https://rpc.testnet.near.org',
      contractName: ContractName,
      walletUrl: 'https://wallet.testnet.near.org',
    };

    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    const near = await nearAPI.connect(Object.assign({ deps: { keyStore } }, nearConfig));
    this._keyStore = keyStore;
    this._nearConfig = nearConfig;
    this._near = near;

    await this.initKey();

    this._lineVersions = Array(BoardHeight).fill(-1);
    this._lines = Array(BoardHeight).fill(false);
    await this.refreshBoard(true);
  }

  async refreshBoard(forced) {
    if (this._refreshBoardTimer) {
      clearTimeout(this._refreshBoardTimer);
      this._refreshBoardTimer = null;
    }
    const t = new Date().getTime();
    if (t < this._stopRefreshTime) {
      this._refreshBoardTimer = setTimeout(async () => {
        await this.refreshBoard(false);
      }, RefreshBoardTimeout);
    }

    if (!forced && document.hidden) {
      return;
    }

    let lineVersions = await this._contract.get_line_versions();
    let needLines = [];
    for (let i = 0; i < BoardHeight; ++i) {
      if (lineVersions[i] !== this._lineVersions[i]) {
        needLines.push(i);
      }
    }
    let requestLines = []
    for (let i = 0; i < needLines.length; i += NumLinesPerFetch) {
      requestLines.push(needLines.slice(i, i + NumLinesPerFetch));
    }

    let results = await Promise.all(requestLines.map(lines => this._contract.get_lines({lines})));
    results = results.flat();
    requestLines = requestLines.flat();
    for (let i = 0; i < requestLines.length; ++i) {
      let lineIndex = requestLines[i];
      let line = decodeLine(results[i]);
      this._lines[lineIndex] = line;
    }

    this._lineVersions = lineVersions;
    this.renderCanvas();
  }

  renderCanvas() {
    if (!this._context || !this._lines) {
      return;
    }

    const ctx = this._context;

    for (let i = 0; i < BoardHeight; ++i) {
      const line = this._lines[i];
      if (!line) {
        continue;
      }
      for (let j = 0; j < BoardWidth; ++j) {
        const p = line[j];
        ctx.fillStyle = intToColor(p.color);
        ctx.fillRect(j * CellWidth, i * CellHeight, CellWidth, CellHeight);
      }
    }

    this._pendingPixels.concat(this._queue).forEach((p) => {
      ctx.fillStyle = intToColor(p.color);
      ctx.fillRect(p.x * CellWidth, p.y * CellHeight, CellWidth, CellHeight);
    })

    if (this.state.selectedCell) {
      const c = this.state.selectedCell;
      if (this.state.pickingColor) {
        const color = this._lines[c.y] ? this._lines[c.y][c.x].color : 0;
        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle = transparentColor(color, 0.5);
        ctx.lineWidth = CellWidth * 4;
        ctx.arc((c.x + 0.5) * CellWidth, (c.y + 0.5) * CellHeight, CellWidth * 4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle = transparentColor(color, 1);
        ctx.lineWidth = CellWidth * 2;
        ctx.arc((c.x + 0.5) * CellWidth, (c.y + 0.5) * CellHeight, CellWidth * 4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
      } else {
        ctx.fillStyle = transparentColor(this.state.currentColor, 0.2);
        ctx.fillRect(c.x * CellWidth, 0, CellWidth, c.y * CellHeight);
        ctx.fillRect(c.x * CellWidth, (c.y+ 1) * CellHeight, CellWidth, (BoardHeight - c.y - 1) * CellHeight);
        ctx.fillRect(0, c.y * CellHeight, c.x * CellWidth, CellHeight);
        ctx.fillRect( (c.x + 1) * CellWidth, c.y * CellHeight, (BoardWidth - c.x - 1) * CellWidth, CellHeight);

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.fillStyle = intToColor(this.state.currentColor);
        ctx.strokeStyle = intToColor(this.state.currentColor);
        ctx.rect(c.x * CellWidth, c.y * CellHeight, CellWidth, CellHeight);
        ctx.stroke();
        ctx.closePath();
      }
    }

    if (!this.state.boardLoaded) {
      this.setState({
        boardLoaded: true
      })
    }
  }

  async requestSignIn() {
    const appTitle = 'NEAR Place';
    await this._walletConnection.requestSignIn(
        ContractName,
        appTitle
    )
  }

  async logOut() {
    this._walletConnection.signOut();
    this._accountId = null;
    this.setState({
      signedIn: !!this._accountId,
      accountId: this._accountId,
    })
  }

  hueColorChange(c) {
    this.setState({
      gammaColors: generateGamma(c.hsl.h)
    })
    this.changeColor(c)
  }

  saveColor() {
    const newColor = intToColor(this.state.currentColor);
    const index = this.state.colors.indexOf(newColor);
    if (index >= 0) {
      this.state.colors.splice(index, 1);
    }
    this.setState({
      colors: [newColor].concat(this.state.colors).slice(0, MaxNumColors)
    });
  }

  changeColor(c) {
    const currentColor = c.rgb.r * 0x010000 + c.rgb.g * 0x000100 + c.rgb.b;
    this.setState({
      pickerColor: c,
      currentColor,
    }, () => {
      this.renderCanvas();
    })
  }

  render() {
    const content = !this.state.connected ? (
        <div>Connecting... <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span></div>
    ) : (!this.state.failedToInitialize ? (
        <div>
          <div className="color-picker">
            <HuePicker color={ this.state.pickerColor } width="100%" disableAlpha={true} onChange={(c) => this.hueColorChange(c)}/>
            <GithubPicker className="circle-picker" colors={this.state.gammaColors} color={ this.state.pickerColor } triangle='hide' width="100%" onChangeComplete={(c) => this.changeColor(c)}/>
            <GithubPicker className="circle-picker" colors={this.state.colors} color={ this.state.pickerColor } triangle='hide' width="100%" onChangeComplete={(c) => this.hueColorChange(c)}/>
          </div>
        </div>
    ) : (
        <div style={{marginBottom: "10px"}}>
          <h1>FAILED TO INITIALIZE THE KEY. TRY TO REFRESH</h1>
        </div>
    ));
    return (
      <div className="px-5">
        <h1>Unlimited NEAR Place</h1>
        {content}
        <div>
          <canvas ref={this.canvasRef}
                  width={800}
                  height={800}
                  className={this.state.boardLoaded ? "pixel-board" : "pixel-board c-animated-background"}>

          </canvas>
        </div>
      </div>
    );
  }
}

export default App;
