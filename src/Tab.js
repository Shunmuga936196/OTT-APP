import { Lightning } from "@lightningjs/sdk";

export default class Tab extends Lightning.Component {
  static _template() {
    return {
      Text: {
        fontSize: 40,
        textColor: 0xff999999,
      },
    };
  }

  set label(val) {
    this._label = val;
    this.tag("Text").text = val;

    /* const iconMap = {
      Home: "home",
      Trending: "trending",
      Movies: "movies",
      Series: "series",
      Search: "search",
    };
    const iconName = iconMap[val] || "default";
    this.tag("Icon").src = `static/images/icons/${iconName}.png`; */
  }

  get label() {
    return this._label;
  }

  set isFocused(val) {
    this.patch({
      text: {
        textColor: val ? 0xffffffff : 0xff999999,
      },
    });
    this.smooth = { scale: val ? 1.2 : 1 };
  }
}
