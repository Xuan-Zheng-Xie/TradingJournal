# Trading Journal
This app helps you calculate position sizes and keep track of your trading history. By carefully managing your position sizes, you can control risk, and by logging your trades, you can clearly see the reasoning behind each entry, making sure your actions align with your strategy.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Web App

```sh
npm run build
```

### Compile for Desktop App

#### make sure you have the necessary tools installed
```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
```sh
cargo install tauri-cli
```
#### initilize tauri in current project
```sh
npm install -g @tauri-apps/cli
tauri init
```
#### add tauri config
```json
{
  "build": {
    "distDir": "../dist",
    "devPath": "http://localhost:3000"
  }
}
```
#### build by tauri
```sh
npx tauri build
```

### Donation
<img src="./src/assets/binance_address.jpg" alt="image" width="280"/>