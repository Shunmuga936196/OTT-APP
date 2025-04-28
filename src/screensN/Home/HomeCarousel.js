import { Lightning, Utils } from "@lightningjs/sdk";

export default class Carousel extends Lightning.Component {
  static _template() {
    return {
      Background: {
        w: window.innerWidth + 50,
        h: 500,
        alpha: 1,
        x: -50,
        y: -20,
        src: Utils.asset("images/slideOne.jpg"), // dynamic
      },
      Info: {
        x: 100,
        y: 300,
        Title: { text: { text: "", fontSize: 50, textColor: 0xffffffff } },
        Subtitle: {
          y: 100,
          text: { text: "", fontSize: 25, textColor: 0xffaaaaaa },
        },
        /* Buttons: {
          y: 200,
          flex: { direction: "row", spacing: 30 },
          WatchNow: {
            rect: true,
            color: 0xff1c1c1e,
            w: 200,
            h: 60,
            shader: { type: Lightning.shaders.RoundedRectangle, radius: 20 },
            Label: {
              x: 20,
              y: 15,
              text: { text: "Watch Now", fontSize: 30, textColor: 0xffffffff },
            },
          },
          InfoButton: {
            rect: true,
            color: 0xff1c1c1e,
            w: 200,
            h: 60,
            shader: { type: Lightning.shaders.RoundedRectangle, radius: 20 },
            Label: {
              x: 20,
              y: 15,
              text: { text: "More Info", fontSize: 30, textColor: 0xffffffff },
            },
          },
        }, */
      },
      /* Arrows: {
        Left: {
          x: 50,
          y: 540,
          text: { text: "<", fontSize: 100, textColor: 0xffffffff },
          alpha: 0.5,
        },
        Right: {
          x: 1820,
          y: 540,
          text: { text: ">", fontSize: 100, textColor: 0xffffffff },
          alpha: 0.5,
        },
      }, */
      Dots: {
        x: window.innerWidth / 2 - 25,
        y: 530,
        mountX: 0.5,
        flex: { direction: "row", spacing: 20 },
      },
    };
  }

  _init() {
    this._index = 0;
    this._slides = [
      {
        background: Utils.asset("images/slideOne.jpg"),
        title: "SUPERBOYS OF MALEGAON",
        subtitle: "New Original Movie",
      },
      {
        background: Utils.asset("images/slide2.jpg"),
        title: "THE BOYS",
        subtitle: "Season 3 Streaming Now",
      },
      {
        background: Utils.asset("images/slide3.png"),
        title: "CITADEL",
        subtitle: "Spy Action Series",
      },
    ];

    this._createDots();
    this._updateSlide();

    // Auto Slide every 5 seconds
    this._autoSlide = setInterval(() => {
      this._handleRight();
    }, 3000);
  }

  _createDots() {
    this.tag("Dots").children = this._slides.map((_, idx) => ({
      rect: true,
      w: 20,
      h: 20,
      shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
      color: idx === this._index ? 0xffffffff : 0xff666666,
    }));
  }

  _updateDots() {
    this.tag("Dots").children.forEach((dot, idx) => {
      dot.patch({ color: idx === this._index ? 0xffffffff : 0xff666666 });
    });
  }

  _updateSlide() {
    const slide = this._slides[this._index];
    // Smooth fade out & in
    // this.tag("Background").setSmooth("alpha", 0);

    // setTimeout(() => {
    this.tag("Background").patch({ src: slide.background });
    //   this.tag("Background").src = Utils.asset("images/logo.png");
    // this.tag("Background").setSmooth("alpha", 1);

    this.tag("Info.Title").patch({ text: { text: slide.title } });
    this.tag("Info.Subtitle").patch({ text: { text: slide.subtitle } });

    this._updateDots();
    // }, 2000);
  }

  _handleLeft() {
    this._index = (this._index - 1 + this._slides.length) % this._slides.length;
    this._updateSlide();
  }

  _handleRight() {
    this._index = (this._index + 1) % this._slides.length;
    this._updateSlide();
  }

  _focus() {
    // Highlight Arrows on Focus
    this.tag("Arrows.Left").patch({ alpha: 1 });
    this.tag("Arrows.Right").patch({ alpha: 1 });
  }

  _unfocus() {
    this.tag("Arrows.Left").patch({ alpha: 0.5 });
    this.tag("Arrows.Right").patch({ alpha: 0.5 });
  }

  _cleanup() {
    // Important to clear Interval when moving screen
    this.stage.clearInterval(this._autoSlide);
  }
}
