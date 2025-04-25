import { Lightning } from "@lightningjs/sdk";
import { TabList } from "./common/constant";

export default class TabBar extends Lightning.Component {
  static _template() {
    return {
      flex: { direction: "row" },
      Tabs: { children: [] },
    };
  }

  _init() {
    this._labels = [...TabList];
    this.setIndex(0);
  }

  setIndex(index) {
    this.tag("Tabs").children = this._labels.map((label, i) => ({
      text: {
        text: label,
        fontSize: i === index ? 36 : 30,
      },
      color: 0xffffffff,
      x: i * 180,
    }));
  }
}
