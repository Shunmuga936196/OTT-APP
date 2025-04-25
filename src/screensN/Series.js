import { Lightning } from "@lightningjs/sdk";
import { fetchTrendingMovies } from "../utlity/api";
import { SERIES, TRENDING } from "../common/constant";
import MediaGrid from "../MediaGridN";

export default class Series extends Lightning.Component {
  static _template() {
    return {
      MediaGrid: {
        type: MediaGrid,
        x: 0,
        y: 0,
        signals: { itemClicked: true },
      },
    };
  }

  async _active() {
    const movies = await fetchTrendingMovies(SERIES);
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
    return this.tag("MediaGrid")._handleDown();
  }
}
