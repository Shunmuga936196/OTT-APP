import { Lightning } from "@lightningjs/sdk";

class MediaTile extends Lightning.Component {
  static _template() {
    return {
      w: 220,
      h: 330,
      rect: true,
      color: 0xff222222,
      Poster: {
        w: 220,
        h: 330,
        border: { color: 0x0066ffff, width: 2, stroke: 4, radius: 20 },
        src: "",
        scale: 1,
      },
    };
  }

  set item(data) {
    this.tag("Poster").src = data.poster;
  }

  _focus() {
    // this.tag("Border").setSmooth("alpha", 1);
    this.tag("Poster").setSmooth("scale", 1.1);
    // console.log("isVisible", this.isVisible());
  }

  _unfocus() {
    // this.tag("Border").setSmooth("alpha", 0);
    this.tag("Poster").setSmooth("scale", 1);
  }
}

export default class MediaGrid extends Lightning.Component {
  static _template() {
    return {
      w: window.innerWidth,
      h: window.innerHeight - 150,
      ItemsWrapper: { type: Lightning.Container },
    };
  }

  _init() {
    this._columns = 29;
    this._itemIndex = 0;
    this._prevIndex = 0;
    const cardWidthWithPadding = 250;
    this._visibleCardCount = Math.floor(
      (this.parentWidth || window.innerWidth) / cardWidthWithPadding
    );
  }

  _inactive() {
    this._itemIndex = 0;
    this._prevIndex = 0;
  }

  set items(list) {
    this._items = list;
    this.bindCards();
  }

  bindCards(xScrollPos) {
    const gap = 30;
    const cardWidth = 220;
    const cardHeight = 330;
    const containerSpace = this.parentName == "search" ? 50 : 0;
    this.tag("ItemsWrapper").children = this._items.map((item, index) => {
      return {
        type: MediaTile,
        ref: "Tile" + index,
        item,
        x:
          (index % this._columns) * (cardWidth + gap) -
          (xScrollPos || 0) +
          containerSpace,
        y:
          Math.floor(index / this._columns) * (cardHeight + gap) +
          containerSpace,
      };
    });
    this.tag("ItemsWrapper").setSmooth("alpha", 1);
  }

  updateTilePositions(xScrollPos) {
    const gap = 30;
    const cardWidth = 220;
    const containerSpace = this.parentName == "search" ? 50 : 0;
    this.tag("ItemsWrapper").children.forEach((cData, index) => {
      cData.patch({
        smooth: {
          x:
            (index % this._columns) * (cardWidth + gap) -
            (xScrollPos || 0) +
            containerSpace,
          duration: 0.3,
        },
      });
    });
  }

  _focus() {
    this._updateFocus();
  }

  _updateFocus(unfocusAll) {
    const wrapper = this.tag("ItemsWrapper");
    const prev = wrapper.getByRef("Tile" + this._prevIndex) || null;
    const current = wrapper.getByRef("Tile" + this._itemIndex) || null;

    if (unfocusAll) {
      if (prev && prev._unfocus) prev._unfocus();
    } else if (this._prevIndex == this._itemIndex) {
      if (current && current._focus) current._focus();
    } else {
      if (prev && prev._unfocus) prev._unfocus();
      if (current && current._focus) current._focus();
    }

    this._prevIndex = this._itemIndex;

    // Scroll logic
    /* const xTarget = -(current.x - 100); // pad left
    const yTarget = -(current.y - 100); // pad top

    wrapper.setSmooth("x", Math.max(Math.min(xTarget, 0), this.w - wrapper.w));
    wrapper.setSmooth("y", Math.max(Math.min(yTarget, 0), this.h - wrapper.h)); */
  }

  _handleLeft() {
    if (this._itemIndex == 0 && this.parentName == "search") {
      this._unfocus();
      this.parent._focus();
    } else {
      if (this._itemIndex % this._columns > 0) {
        this._itemIndex--;
        this._updateFocus();
        const _element = this.tag("ItemsWrapper").getByRef(
          "Tile" + this._itemIndex
        );
        if (!this.isVisible(_element)) {
          this.updateTilePositions(this._itemIndex * 250);
        }
      }
    }
  }

  _handleRight() {
    if (
      (this._itemIndex + 1) % this._columns !== 0 &&
      this._itemIndex < this._items.length - 1
    ) {
      this._itemIndex++;
      this._updateFocus();
      const currentSelectedCardNum = this._itemIndex + 1;
      const _element = this.tag("ItemsWrapper").getByRef(
        "Tile" + this._itemIndex
      );
      if (
        currentSelectedCardNum > this._visibleCardCount &&
        this._itemIndex < this._items.length &&
        !this.isVisible(_element)
      ) {
        this.updateTilePositions(
          (currentSelectedCardNum - this._visibleCardCount) * 250
        );
      }
    }
  }

  isVisible(_element) {
    const element = _element; // or this.tag('YourElement')
    const stage = this.parentName == "search" ? this.parent : this.stage;

    // Get element bounds
    const elementRight = element.x + element.w;
    const elementBottom = element.y + element.h;

    // Check if outside canvas
    return (
      elementRight > 0 &&
      element.x < stage.w &&
      elementRight < stage.w &&
      elementBottom > 0 &&
      element.y < stage.h
    );
  }

  _handleUp() {
    if (this._itemIndex - this._columns >= 0) {
      this._itemIndex -= this._columns;
      this._updateFocus();
      /* const scrollHeight =
        (Math.ceil(newIndex / this._columns) - 1) * (330 + 20); */
      // this.setSmooth({ y: scrollHeight });
    } else {
      this._updateFocus(true);
      this.signal("itemClicked");
    }
  }

  _handleDown() {
    const newIndex = this._itemIndex + this._columns;
    if (newIndex < this._items.length) {
      this._itemIndex = newIndex;
      this._updateFocus();
      const scrollHeight =
        (Math.ceil(newIndex / this._columns) - 1) * (330 + 20);
      this.patch({
        smooth: {
          y: -scrollHeight,
          duration: 0.3,
        },
      });
    }
  }
}
