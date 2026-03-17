# Chinese Kinship Calculator (称呼 Calculator)

A simple, intuitive calculator app that helps users determine the correct Chinese kinship terms for distant relatives.

## 📱 Overview

Chinese family relationships can be complex, especially when it comes to extended relatives. This app simplifies the process by allowing users to "calculate" relationships step-by-step using a familiar calculator-style interface.

Instead of memorizing complicated naming rules, users can input relationship components and instantly get the correct term.

## ✨ Features

* 🧮 Calculator-style interface for intuitive interaction
* 👨‍👩‍👧 Visual relationship building (e.g., father → brother → son)
* ❓ Handles ambiguous or distant relations
* ⚡ Instant results
* 🎯 Minimalist design with only essential elements

## 🧠 How It Works

The app models family relationships as a sequence of steps:

* Start from "self"
* Add relationship components (e.g., father, mother, sibling)
* The system computes the final kinship term

Example:

```
Self → Father → Sister → Son = Cousin (表弟 / 堂弟 depending on lineage)
```

## 🎨 Design Philosophy

The app icon and UI follow a **minimal, three-color design system**:

* Primary: Warm red-orange
* Secondary: Light neutral background
* Accent: White

This keeps the interface clean, culturally resonant, and easy to recognize.

## 🛠️ Tech Stack (Suggested)

* Frontend: React Native / Flutter / SwiftUI
* Logic Engine: JavaScript / TypeScript / Python
* Data Model: Graph-based relationship mapping

## 📂 Project Structure

```
/kinship-calculator
  ├── src/
  │   ├── components/
  │   ├── logic/
  │   ├── data/
  │   └── screens/
  ├── assets/
  │   └── icon.png
  ├── README.md
  └── package.json
```

## 🚀 Getting Started

1. Clone the repository:

```
git clone https://github.com/your-username/kinship-calculator.git
cd kinship-calculator
```

2. Install dependencies:

```
npm install
```

3. Run the app:

```
npm start
```

## 🔮 Future Improvements

* 🌏 Support for multiple dialects (Mandarin, Cantonese, etc.)
* 🗣️ Voice input for relationship queries
* 🧾 Explanation mode (how the result was derived)
* 👪 Family tree visualization

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License

---

## Short GitHub Description

A minimalist calculator-style app that computes Chinese kinship terms for complex family relationships.
