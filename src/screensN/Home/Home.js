import { Lightning } from "@lightningjs/sdk";
import MediaGrid from "../../MediaGridN";
import { HOME } from "../../common/constant";
import { fetchTrendingMovies } from "../../utlity/api";
import Carousel from "./HomeCarousel";

export default class Home extends Lightning.Component {
  static _template() {
    return {
      Carousel: {
        y: 0,
        type: Carousel,
        visible: true,
        ref: "HomeCarousel",
        alpha: 1,
      },
      MediaGrid: {
        type: MediaGrid,
        x: 0,
        y: 580,
        signals: { itemClicked: true },
        parentName: HOME,
      },
    };
  }

  async _active() {
    const movies = await fetchTrendingMovies(HOME);
    this.tag("MediaGrid").items = movies;
  }

  _focus() {
    if (!this.hasFocus()) {
      this.tag("MediaGrid")._focus();
    }
  }

  _handleUp() {
    const grid = this.tag("MediaGrid");
    if (grid.isAtTopRow) {
      this.signal("FocusTabBar");
    } else {
      grid._handleUp();
      // this.emit("itemClicked");
    }
  }

  itemClicked() {
    this.signal("itemClicked");
  }

  _handleLeft() {
    return this.tag("MediaGrid")._handleLeft();
  }
  _handleRight() {
    return this.tag("MediaGrid")._handleRight();
  }
  _handleDown() {
    debugger;
    return this.tag("MediaGrid")._handleDown();
  }
}
