import { Lightning } from "@lightningjs/sdk";
import { Keys, SEARCH } from "../common/constant";
import MediaGrid from "../MediaGridN";
import { fetchTrendingMovies } from "../utlity/api";

export default class SearchComponent extends Lightning.Component {
  static _template() {
    return {
      // Semi-transparent background overlay
      Background: {
        rect: true,
        w: window.innerWidth / 2,
        h: window.innerHeight - 150,
        color: 0x80000000,
        visible: false,
      },

      // Main search container
      SearchContainer: {
        x: 50,
        y: 50, // Centered position
        // Search input box
        SearchBox: {
          rect: true,
          w: window.innerWidth / 2 - 100,
          h: 70,
          color: 0xff222222,
          border: { width: 2, color: 0xffffffff },
          Text: {
            x: 20,
            y: 20,
            text: {
              text: this.bindProp("_searchText"),
              fontSize: 28,
              textColor: 0xffffffff,
              maxLines: 1,
              textOverflow: "ellipsis",
            },
          },
          Cursor: {
            rect: true,
            w: 2,
            h: 30,
            color: 0xffffffff,
            visible: false,
            x: 20,
            y: 20,
          },
        },

        // Virtual keypad
        Keypad: {
          visible: false,
          x: 50,
          y: 120,
          Keys: {
            children: this._generateKeyLayout(),
          },
        },
      },

      MediaGrid: {
        type: MediaGrid,
        rect: true,
        x: window.innerWidth / 2,
        y: 0,
        w: window.innerWidth / 2 - 50,
        h: window.innerHeight - 150,
        color: 0xfffffff,
        signals: { itemClicked: true },
        visible: true,
        parentName: "search",
        parentHeight: window.innerWidth / 2,
        parentWidth: window.innerHeight - 150,
        clipping: true,
        Content: {
          children: this.bindProp("items"), // Bound to items array
        },
      },
    };
  }

  static _generateKeyLayout() {
    const keys = [...Keys];

    return keys.map((key, i) => {
      return {
        type: Key,
        x: (i % 10) * 60 + (i >= 30 ? 10 : 0),
        y: Math.floor(i / 10) * 60,
        label: key,
        ref: `Key_${key}`,
      };
    });
  }

  _init() {
    this._searchText = "";
    this._focusedKeyIndex = 0;
    this._cursorInterval = null;
    this._blinkCursor(true);
    this.cardListLength = 0;
  }

  _active() {
    this._setupKeySignals();
  }

  _inactive() {
    clearInterval(this._cursorInterval);
  }

  _setupKeySignals() {
    const keys = this.tag("SearchContainer.Keypad.Keys").children;
    keys.forEach((key) => {
      key.patch({
        signals: { keyPressed: true },
      });
      key.on("keyPressed", (key) => this._handleKeyPress(key));
    });
  }

  _blinkCursor(visible) {
    clearInterval(this._cursorInterval);
    this.tag("SearchContainer.SearchBox.Cursor").visible = visible;
    this._cursorInterval = setInterval(() => {
      const cursor = this.tag("SearchContainer.SearchBox.Cursor");
      cursor.visible = !cursor.visible;
    }, 500);
  }

  _updateCursorPosition() {
    const textWidth = this._searchText.length * 13 || 0;
    this.tag("SearchContainer.SearchBox.Cursor").x = 40 + textWidth;
  }

  _focus() {
    this.patch({
      Background: { visible: true },
      SearchContainer: {
        SearchBox: {
          border: { color: 0xff00ff00 },
          Cursor: { visible: true },
        },
        Keypad: {
          visible: true,
          alpha: 0,
          smooth: { alpha: 1, y: 120, duration: 0.2 },
        },
      },
    });
    this._refocusKeypad();
  }

  _unfocus() {
    this.patch({
      Background: { visible: false },
      SearchContainer: {
        SearchBox: { border: { color: 0xffffffff } },
        Keypad: {
          visible: false,
          smooth: { alpha: 0, y: 60, duration: 0.2 },
          onComplete: () => this.patch({ Keypad: { visible: false } }),
        },
      },
    });
    this._blinkCursor(false);
  }

  _getFocused() {
    if (this.tag("SearchContainer.Keypad").visible) {
      return this.tag("SearchContainer.Keypad.Keys").children[
        this._focusedKeyIndex
      ];
    } else if (
      !this.tag("SearchContainer.Keypad").visible &&
      !!this.cardListLength
    ) {
      return this.tag("MediaGrid")._focus();
    }
    return this.tag("SearchContainer.SearchBox");
  }

  _refocusKeypad() {
    this._focusedKeyIndex = 0;
    // this._setState("KeypadFocused");
  }

  _handleLeft(event) {
    if (
      this.tag("MediaGrid").hasFocus() ||
      !this.tag("SearchContainer.Keypad").visible
    )
      return this.tag("MediaGrid")._handleLeft();
    return this._handleKey(event);
  }
  _handleRight(event) {
    if (
      this.tag("MediaGrid").hasFocus() ||
      !this.tag("SearchContainer.Keypad").visible
    )
      return this.tag("MediaGrid")._handleRight();
    return this._handleKey(event);
  }

  _handleKey(event) {
    if (!this.tag("SearchContainer.Keypad").visible) return;

    const keys = this.tag("SearchContainer.Keypad.Keys").children;
    const cols = 10;
    const totalKeys = keys.length;

    switch (event.key) {
      case "ArrowUp":
        if (this._focusedKeyIndex > 9) {
          this._focusedKeyIndex = Math.max(this._focusedKeyIndex - cols, 0);
        } else {
          this.signal("itemClicked");
        }
        break;
      case "ArrowDown":
        this._focusedKeyIndex = Math.min(
          this._focusedKeyIndex + cols,
          totalKeys - 1
        );
        break;
      case "ArrowLeft":
        this._focusedKeyIndex = Math.max(this._focusedKeyIndex - 1, 0);
        break;
      case "ArrowRight":
        this._focusedKeyIndex = Math.min(
          this._focusedKeyIndex + 1,
          totalKeys - 1
        );
        const lastNum = [9, 19, 29, 38];
        if (
          lastNum.indexOf(this._focusedKeyIndex) > -1 &&
          this.cardListLength
        ) {
          this._unfocus();
          this.tag("MediaGrid")._focus();
        }
        break;
      case "Del":
        this._handleKeyPress("Del");
        break;
    }
  }

  keyPressed(key) {
    if (key === "Del") {
      this._searchText = this._searchText.slice(0, -1);
    } else if (key === "up") {
      // Handle shift key for uppercase
    } else if (key === "left") {
      // Move cursor left
    } else if (key === "Search") {
      this.searchMovies();
    } else if (key === "__") {
      this._searchText += " ";
    } else {
      this._searchText += key;
    }
    this._updateCursorPosition();
  }

  async searchMovies() {
    const movies = await fetchTrendingMovies(
      SEARCH,
      `&query=${this._searchText}`
    );
    this.tag("MediaGrid").items = movies;
    this.cardListLength = movies.length;
    this._unfocus();
    setTimeout(() => {
      this.tag("MediaGrid")._focus();
    }, 100);
  }

  get searchText() {
    return this._searchText;
  }

  set searchText(value) {
    this._searchText = value;
    this._updateCursorPosition();
  }
}

class Key extends Lightning.Component {
  static _template() {
    return {
      rect: true,
      w: this.bindProp("w"),
      h: this.bindProp("h"),
      color: 0xff444444,
      Label: {
        x: (w) => w / 2,
        y: (h) => h / 2,
        mount: 0.5,
        text: {
          text: this.bindProp("label"),
          fontSize: 20,
          textColor: 0xffffffff,
        },
      },
    };
  }

  _focus() {
    this.patch({
      color: 0xff666666,
      smooth: { scale: 1.5, duration: 0.1 },
    });
    // this._setState("Focused");
    this.application.emit("playSound", "focus"); // Optional sound effect
  }

  _unfocus() {
    this.patch({
      color: 0xff444444,
      smooth: { scale: 1.0, duration: 0.1 },
    });
  }

  _handleEnter() {
    this.signal("keyPressed", this.label);
    this.application.emit("playSound", "select"); // Optional sound effect
  }
}
