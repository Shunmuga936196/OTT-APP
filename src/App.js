import { Lightning } from "@lightningjs/sdk";
import TabBar from "./TabBar";
import Movies from "./screensN/Movies";
import { TabList } from "./common/constant";
import Trending from "./screensN/Trending";
import Series from "./screensN/Series";
import SearchComponent from "./searchComponent/searchComponent";
import Home from "./screensN/Home/Home";

export default class App extends Lightning.Component {
  static _template() {
    let PageData = {};
    const _pages = {
      Home,
      Trending,
      Movies,
      Series,
      Search: SearchComponent,
    };
    TabList.forEach((pageName) => {
      PageData[pageName] = {
        type: _pages[pageName],
        visible: false,
        signals: { itemClicked: true },
      };
    });
    return {
      w: window.innerWidth,
      h: window.innerHeight,
      clearColor: 0xff1e1e1e,
      Tabs: {
        type: TabBar,
        x: 40,
        y: 20,
      },
      Pages: {
        x: 30,
        y: 100,
        ...PageData,
      },
    };
  }

  focusTabBar() {
    this._focusedSection = "tabs";
    this.tag("Pages")._focus;
  }

  _init() {
    this._tabNames = [...TabList];
    this._currentIndex = 0;
    this._focusedSection = "tabs";
    this._switchTab(0);
  }

  itemClicked() {
    this._focusedSection = "tabs";
    this._focus();
  }

  _switchTab(index) {
    this._currentIndex = index;
    const tab = this._tabNames[index];
    this.tag("Pages").children.forEach((cData) => {
      cData.visible = cData.__ref == tab;
    });
    this.tag("Tabs").setIndex(index);
  }

  _handleLeft() {
    if (this._focusedSection === "tabs" && this._currentIndex > 0) {
      this._switchTab(this._currentIndex - 1);
    }
  }

  _handleRight() {
    if (
      this._focusedSection === "tabs" &&
      this._currentIndex < this._tabNames.length - 1
    ) {
      this._switchTab(this._currentIndex + 1);
    }
  }

  _handleDown() {
    if (this._focusedSection === "tabs") {
      this._focusedSection = "screen";
      this.tag("Pages").getByRef(this._tabNames[this._currentIndex])._focus();
    }
  }

  _getFocused() {
    if (this._focusedSection === "screen") {
      return this.tag("Pages").getByRef(this._tabNames[this._currentIndex]);
    } else if (this._focusedSection === "tabs") {
      return this;
    }
    return this;
  }
}
