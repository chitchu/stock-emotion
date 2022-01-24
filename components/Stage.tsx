import Sketch from 'react-p5';
import p5Types from 'p5';
import { useCallback, useEffect, useRef, useState } from 'react';

// let startTime;
// let elapsedTime;
// let x;
// let y;
// let excite;
// let state = 'nervous';
// let lastState = state;
// let timeInState = 0;
// let day = 0;
// let lastDay = 0;
// let smileH = 0.16;
// let smileW = 0.3;
// let colors;
// let targetColor;
// let currentColor;
// let prices;
// let priceWindow = [];
// let gainDay = 1;
// let gainWeek = 0;
// let gainAllTime = 0;

interface Props {
  uniqueSymbol: string;
}

export default function Stage(props: Props) {
  const elapsedTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const targetColorRef = useRef<ReturnType<p5Types['color']>>();
  const currentColorRef = useRef<ReturnType<p5Types['color']>>();
  const coordinatesRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const exciteRef = useRef(0.5);
  const dayRef = useRef(0);
  const lastDayRef = useRef(0);
  const gainDayRef = useRef(0);
  const gainWeekRef = useRef(0);
  const priceWindowRef = useRef<number[]>([]);
  const timeInStateRef = useRef(0);
  const coloursRef = useRef<Record<string, ReturnType<p5Types['color']>>>({});
  const stateRef = useRef<
    'nervous' | 'excited' | 'surprised' | 'stressed' | 'sad'
  >('nervous');
  const lastStateRef = useRef<
    'nervous' | 'excited' | 'surprised' | 'stressed' | 'sad'
  >(stateRef.current);

  const smileHRef = useRef(0.16);
  const smileWRef = useRef(0.3);
  const setup = useCallback(
    (p5: p5Types, canvasParentRef: Element) => {
      p5.createCanvas(600, 600).parent(canvasParentRef);
      startTimeRef.current = p5.millis();
      console.log(startTimeRef.current);
      coloursRef.current = {
        nervous: p5.color(248, 244, 151), //yellow
        sad: p5.color(231, 231, 232), //grey
        stressed: p5.color(244, 144, 153), //red
        surprised: p5.color(174, 219, 192), //green
        excited: p5.color(213, 155, 204), //purple
      };
      targetColorRef.current = coloursRef.current[stateRef.current];
      currentColorRef.current = coloursRef.current[stateRef.current];
      coordinatesRef.current.x = p5.width / 2;
      coordinatesRef.current.y = p5.height / 2;
    },
    [props.uniqueSymbol]
  );

  const [prices, setPrices] = useState<{ date: number; close: number }[]>([]);

  const draw = useCallback(
    (p5: p5Types) => {
      // define functions

      function classState() {
        //1 second per day
        let price = 0;
        dayRef.current = Math.floor(elapsedTimeRef.current / 1000);

        //move on 1 day
        if (dayRef.current > lastDayRef.current) {
          if (prices[dayRef.current]) {
            //add latest price
            priceWindowRef.current.push(prices[dayRef.current].close);
            //remove last
            priceWindowRef.current.shift();
            lastDayRef.current = dayRef.current;
          } else {
            dayRef.current = lastDayRef.current;
          }
        }

        if (prices[dayRef.current]) {
          price = prices[dayRef.current].close;
          //console.log(price);
          if (prices[dayRef.current - 1]) {
            gainDayRef.current = price / prices[dayRef.current - 1].close;
            //console.log(gainDayRef.current);
          }
        }

        //class state
        let minT = 3;
        let maxT = 10;
        gainWeekRef.current = 100 * (price / priceWindowRef.current[0] - 1);
        if (gainWeekRef.current > maxT) {
          stateRef.current = 'excited';
        } else if (gainWeekRef.current > minT) {
          stateRef.current = 'surprised';
        } else if (gainWeekRef.current < -maxT) {
          stateRef.current = 'stressed';
        } else if (gainWeekRef.current < -minT) {
          stateRef.current = 'sad';
        } else {
          stateRef.current = 'nervous';
        }

        timeInStateRef.current += 1;

        //state change
        if (stateRef.current != lastStateRef.current) {
          timeInStateRef.current = 0;
          lastStateRef.current = stateRef.current;
        }

        //state='nervous';
      }

      function priceChart(x: number, y: number, w: number, h: number) {
        p5.stroke(0);
        p5.strokeWeight(2);
        p5.noFill();
        var steps = priceWindowRef.current.length + 1;
        var gap = w / steps;

        var min = Math.min(...priceWindowRef.current);
        var max = Math.max(...priceWindowRef.current);

        p5.beginShape();
        for (let i = 0; i < steps; i++) {
          var y1 = (priceWindowRef.current[i] - min) / (max - min);
          var y2 = (priceWindowRef.current[i + 1] - min) / (max - min);
          p5.vertex(x + i * gap, y - h * y1);
          p5.vertex(x + (i + 1) * gap, y - h * y2);
        }
        p5.endShape();
      }

      function setHisColor() {
        targetColorRef.current = coloursRef.current[stateRef.current];
        var oldColor = coloursRef.current[lastStateRef.current];
        var n = timeInStateRef.current / 200;
        currentColorRef.current = p5.lerpColor(
          oldColor,
          targetColorRef.current,
          n
        );
        p5.fill(currentColorRef.current);
      }

      function semi(x: number, y: number, w: number, h: number) {
        p5.beginShape();
        p5.vertex(x - w, y);
        //from left to middle
        p5.bezierVertex(x, y, x - w, y, x, y);
        //middle down!
        p5.bezierVertex(x, y + h, x, y, x, y + h);
        //drop to middle of mouth then back!
        p5.bezierVertex(x - w / 2, y + h, x - w, y + h / 2, x - w, y);
        p5.endShape();
        //right side!!
        p5.beginShape();
        p5.vertex(x + w, y);
        //from left to middle
        p5.bezierVertex(x, y, x + w, y, x, y);
        //middle down!
        p5.bezierVertex(x, y + h, x, y, x, y + h);
        //drop to middle of mouth then back!
        p5.bezierVertex(x + w / 2, y + h, x + w, y + h / 2, x + w, y);
        p5.endShape();
      }

      function drawMouth(w2: number, h2: number) {
        //1/8 wide, middle
        p5.stroke(0);
        p5.strokeWeight(8);
        p5.fill(0);
        //line(x-(w2*0.33),y, x+(w2*0.33), y)
        // let smileH = 0.16;
        // let smileW = 0.3;

        //slowly return to 0
        smileHRef.current *= 0.99;
        smileWRef.current *= 0.99;

        smileHRef.current = smileHRef.current + (gainDayRef.current - 1) / 10;
        smileHRef.current = Math.max(Math.min(smileHRef.current, 0.3), -0.4);

        smileWRef.current = smileWRef.current - (gainDayRef.current - 1) / 10;
        smileWRef.current = Math.max(Math.min(smileWRef.current, 0.3), 0.2);

        //draw regular smile
        if (smileHRef.current > 0) {
          semi(
            coordinatesRef.current.x,
            coordinatesRef.current.y,
            w2 * smileWRef.current,
            h2 * smileHRef.current
          );
        } else if (smileHRef.current < -0.1) {
          //zigzag
          let steps = 8;
          let startX = coordinatesRef.current.x - w2 * smileWRef.current;
          let startY = coordinatesRef.current.y;
          let incrementXY = (w2 * smileWRef.current * 2) / steps;
          for (let i = 0; i < steps; i++) {
            var newY = i % 2 == 0 ? startY - incrementXY : startY + incrementXY;
            p5.line(startX, startY, startX + incrementXY, newY);
            startY = newY;
            startX += incrementXY;
          }
        } else {
          //draw sad face arc
          p5.noFill();
          p5.beginShape();
          //left corner
          p5.vertex(
            coordinatesRef.current.x - w2 * smileWRef.current,
            coordinatesRef.current.y
          );
          //from left to middle
          p5.bezierVertex(
            coordinatesRef.current.x - 10,
            coordinatesRef.current.y + h2 * smileHRef.current,
            coordinatesRef.current.x + 10,
            coordinatesRef.current.y + h2 * smileHRef.current,
            coordinatesRef.current.x + w2 * smileWRef.current,
            coordinatesRef.current.y
          );
          p5.endShape();
        }
      }
      function drawEyes(w2: number, h2: number) {
        //eyes, brows and bags??

        let eyeW = 40;
        let eyeH = 0.4;
        let eyeBagH = 0.4 / 2;
        let eyeBagW = 0.6 / 2;

        // under eyes

        if (stateRef.current === 'sad') {
          eyeBagW = eyeBagW * 1.2;
        }
        if (stateRef.current === 'stressed') {
          eyeBagW = eyeBagW * 1.4;
        }
        p5.strokeWeight(8);
        p5.stroke(241, 104, 114);
        p5.fill(241, 104, 114);

        semi(
          coordinatesRef.current.x - w2 / 2,
          coordinatesRef.current.y,
          eyeW * eyeBagW,
          -(eyeW * eyeBagH)
        );
        semi(
          coordinatesRef.current.x + w2 / 2,
          coordinatesRef.current.y,
          eyeW * eyeBagW,
          -(eyeW * eyeBagH)
        );

        //eyes
        switch (stateRef.current) {
          case 'stressed':
            p5.stroke(0);
            p5.strokeWeight(8);
            eyeW = 30;
            //left edge to middle and back
            p5.line(
              coordinatesRef.current.x - w2 / 2 - eyeW / 2,
              coordinatesRef.current.y - h2 * eyeH - eyeW / 2,
              coordinatesRef.current.x - w2 / 2 + eyeW / 2,
              coordinatesRef.current.y - h2 * eyeH
            );
            p5.line(
              coordinatesRef.current.x - w2 / 2 - eyeW / 2,
              coordinatesRef.current.y - h2 * eyeH + eyeW / 2,
              coordinatesRef.current.x - w2 / 2 + eyeW / 2,
              coordinatesRef.current.y - h2 * eyeH
            );
            //right
            p5.line(
              coordinatesRef.current.x + w2 / 2 + eyeW / 2,
              coordinatesRef.current.y - h2 * eyeH - eyeW / 2,
              coordinatesRef.current.x + w2 / 2 - eyeW / 2,
              coordinatesRef.current.y - h2 * eyeH
            );
            p5.line(
              coordinatesRef.current.x + w2 / 2 + eyeW / 2,
              coordinatesRef.current.y - h2 * eyeH + eyeW / 2,
              coordinatesRef.current.x + w2 / 2 - eyeW / 2,
              coordinatesRef.current.y - h2 * eyeH
            );
            break;

          case 'excited':
            //star eyes!!
            eyeW = 60;
            p5.fill(0);
            p5.strokeWeight(0);
            p5.textSize(eyeW);
            p5.text(
              '⭐️',
              coordinatesRef.current.x - w2 / 2,
              coordinatesRef.current.y - h2 * eyeH + eyeW / 3
            );
            p5.text(
              '⭐️',
              coordinatesRef.current.x + w2 / 2,
              coordinatesRef.current.y - h2 * eyeH + eyeW / 3
            );

            break;
          default:
            //nervous, sad, surprised
            //eye 1/4 left and 1/4 up
            p5.fill(0);
            p5.strokeWeight(0);
            p5.circle(
              coordinatesRef.current.x - w2 / 2,
              coordinatesRef.current.y - h2 * eyeH,
              eyeW
            );
            p5.circle(
              coordinatesRef.current.x + w2 / 2,
              coordinatesRef.current.y - h2 * eyeH,
              eyeW
            );
            //pupil

            p5.strokeWeight(0);
            p5.fill(255);
            let offset = 0.15;
            let pupilSize = 0.3;
            p5.circle(
              coordinatesRef.current.x - w2 / 2 - eyeW * offset,
              coordinatesRef.current.y - h2 * eyeH - eyeW * offset,
              eyeW * pupilSize
            );
            p5.circle(
              coordinatesRef.current.x + w2 / 2 - eyeW * offset,
              coordinatesRef.current.y - h2 * eyeH - eyeW * offset,
              eyeW * pupilSize
            );
        }

        //brows!
        switch (stateRef.current) {
          case 'nervous':
            p5.stroke(0);
            p5.strokeWeight(8);
            eyeW = 30;
            //left bottom then up
            p5.line(
              coordinatesRef.current.x - w2 / 2 - eyeW,
              coordinatesRef.current.y - h2 * eyeH - eyeW / 3,
              coordinatesRef.current.x - w2 / 2 + eyeW / 2,
              coordinatesRef.current.y - h2 * eyeH - eyeW
            );
            p5.line(
              coordinatesRef.current.x + w2 / 2 + eyeW,
              coordinatesRef.current.y - h2 * eyeH - eyeW / 3,
              coordinatesRef.current.x + w2 / 2 - eyeW / 2,
              coordinatesRef.current.y - h2 * eyeH - eyeW
            );
            break;

          case 'sad':
            //add blue tears
            p5.strokeWeight(8);
            p5.stroke(0, 174, 239);
            p5.fill(0, 174, 239);

            semi(
              coordinatesRef.current.x - w2 / 2,
              coordinatesRef.current.y - h2 * eyeH + eyeW / 2,
              eyeW * 0.2,
              -(eyeW * 0.1)
            );
            semi(
              coordinatesRef.current.x + w2 / 2,
              coordinatesRef.current.y - h2 * eyeH + eyeW / 2,
              eyeW * 0.2,
              -(eyeW * 0.1)
            );

            break;
          case 'surprised':
            //nervous, sad, surprised
            //eye 1/4 left and 1/4 up
            p5.stroke(0);
            p5.noFill();
            p5.strokeWeight(8);
            p5.arc(
              coordinatesRef.current.x - w2 / 2,
              coordinatesRef.current.y - h2 * eyeH - eyeW / 4,
              eyeW * 1.2,
              eyeW * 1.2,
              -p5.HALF_PI - p5.QUARTER_PI,
              -p5.HALF_PI + p5.QUARTER_PI
            );
            p5.arc(
              coordinatesRef.current.x + w2 / 2,
              coordinatesRef.current.y - h2 * eyeH - eyeW / 4,
              eyeW * 1.2,
              eyeW * 1.2,
              -p5.HALF_PI - p5.QUARTER_PI,
              -p5.HALF_PI + p5.QUARTER_PI
            );

            break;
        }
      }

      // End functions

      if (prices.length === 0) {
        return;
      }
      elapsedTimeRef.current = p5.millis() - startTimeRef.current;

      classState();

      p5.background(255);

      priceChart(coordinatesRef.current.x - 50, 100, 150, 30);

      // A cylic value between -1 and 1
      var sinus = Math.sin((elapsedTimeRef.current / 1000) * 4);

      let targetY = coordinatesRef.current.y;
      let widthToScreen = 0.5 + 0.02 * sinus;
      let aspect = 0.7 - 0.02 * sinus;
      let w2 = (widthToScreen * p5.width) / 2; //320;
      let h2 = aspect * w2; //225
      let floorY = p5.height * 0.8;

      //0 plus the daily return from -5% to anything
      //let exciteTarget = (Math.max((gainDayRef.current-0.95),0));
      //try adding and removing to the excite amount
      exciteRef.current = exciteRef.current + (gainDayRef.current - 1) / 10;
      exciteRef.current = Math.max(Math.min(exciteRef.current, 1), 0);

      //if(excite>exciteTarget){excite=excite-0.01}else{excite=excite+0.01}

      //console.log(excite, gainDayRef.current-1);

      coordinatesRef.current.y =
        floorY - (1 + exciteRef.current) * h2 - exciteRef.current * h2 * sinus;

      //console.log(x,y,w2*2,h2*2, y-h2);

      // shadow
      // underneath but at a fixed position
      p5.strokeWeight(0);
      p5.fill(230);
      p5.ellipse(
        coordinatesRef.current.x,
        floorY,
        w2 * 1.5 + sinus * w2 * 0.1,
        h2 / 2 + sinus * h2 * 0.1
      );

      setHisColor();
      p5.stroke(0);
      p5.strokeWeight(8);
      p5.beginShape();
      //middle top start
      //x,y in middle
      //T x, T y
      p5.vertex(coordinatesRef.current.x, coordinatesRef.current.y - h2);
      //bezierVertex(TLp x, TLp y, LTp x, LTp y, L x, L y);
      p5.bezierVertex(
        coordinatesRef.current.x - w2,
        coordinatesRef.current.y - h2,
        coordinatesRef.current.x - w2,
        coordinatesRef.current.y - h2 * 0.5,
        coordinatesRef.current.x - w2,
        coordinatesRef.current.y
      );
      //bezierVertex(LBp x, LBp y, BLp x, BLp y, B x, B y);
      p5.bezierVertex(
        coordinatesRef.current.x - w2,
        coordinatesRef.current.y + h2 * 0.66,
        coordinatesRef.current.x - w2 * 0.7,
        coordinatesRef.current.y + h2,
        coordinatesRef.current.x,
        coordinatesRef.current.y + h2
      );
      //bezierVertex(BRp x, BRp y, RBp x, RBp y, R x, R y);
      p5.bezierVertex(
        coordinatesRef.current.x + w2 * 0.7,
        coordinatesRef.current.y + h2,
        coordinatesRef.current.x + w2,
        coordinatesRef.current.y + h2 * 0.66,
        coordinatesRef.current.x + w2,
        coordinatesRef.current.y
      );
      //bezierVertex(RTp x, RTp y, TRp x, TRp y, T x, T y);
      p5.bezierVertex(
        coordinatesRef.current.x + w2,
        coordinatesRef.current.y - h2 * 0.5,
        coordinatesRef.current.x + w2,
        coordinatesRef.current.y - h2,
        coordinatesRef.current.x,
        coordinatesRef.current.y - h2
      );
      p5.endShape();

      //shadow
      p5.beginShape();
      //middle top start
      //x,y in middle
      //T x, T y
      p5.strokeWeight(0);
      p5.fill('rgba(0,0,0,0.2)');
      p5.vertex(coordinatesRef.current.x, coordinatesRef.current.y + h2 * 0.7);
      //bezierVertex(TLp x, TLp y, LTp x, LTp y, L x, L y);
      p5.bezierVertex(
        coordinatesRef.current.x - w2,
        coordinatesRef.current.y + h2 * 0.7,
        coordinatesRef.current.x - w2,
        coordinatesRef.current.y + h2 * 0.2,
        coordinatesRef.current.x - w2,
        coordinatesRef.current.y
      );
      //bezierVertex(LBp x, LBp y, BLp x, BLp y, B x, B y);
      p5.bezierVertex(
        coordinatesRef.current.x - w2,
        coordinatesRef.current.y + h2 * 0.66,
        coordinatesRef.current.x - w2 * 0.7,
        coordinatesRef.current.y + h2,
        coordinatesRef.current.x,
        coordinatesRef.current.y + h2
      );
      //bezierVertex(BRp x, BRp y, RBp x, RBp y, R x, R y);
      p5.bezierVertex(
        coordinatesRef.current.x + w2 * 0.7,
        coordinatesRef.current.y + h2,
        coordinatesRef.current.x + w2,
        coordinatesRef.current.y + h2 * 0.66,
        coordinatesRef.current.x + w2,
        coordinatesRef.current.y
      );
      //bezierVertex(RTp x, RTp y, TRp x, TRp y, T x, T y);
      p5.bezierVertex(
        coordinatesRef.current.x + w2,
        coordinatesRef.current.y + h2 * 0.2,
        coordinatesRef.current.x + w2,
        coordinatesRef.current.y + h2 * 0.7,
        coordinatesRef.current.x,
        coordinatesRef.current.y + h2 * 0.7
      );
      p5.endShape();

      //mouth
      drawMouth(w2, h2);

      drawEyes(w2, h2);

      //text
      p5.fill(0);
      p5.strokeWeight(0);
      p5.textSize(20);
      p5.textFont('Georgia');
      p5.textAlign(p5.CENTER);
      p5.text(props.uniqueSymbol, coordinatesRef.current.x, 40);
      //text('Day ' + day + ' ' + state + ' ' + gainWeek.toFixed(2) + '%', x, height - 40);
      p5.text(
        'Day ' + dayRef.current,
        coordinatesRef.current.x,
        p5.height - 40
      );
      p5.text(
        ((gainDayRef.current - 1) * 100).toFixed(2) + '%',
        coordinatesRef.current.x,
        p5.height - 20
      );
    },
    [prices, props.uniqueSymbol]
  );

  useEffect(() => {
    async function fetchPrices() {
      const raw = await fetch(
        `https://api.simplywall.st/api/company/price/${props.uniqueSymbol}?start_timestamp=1485023880000`
      );
      const response = await raw.json();
      setPrices(response.data);
    }
    fetchPrices();
    //
  }, [props.uniqueSymbol]);

  return <Sketch setup={setup} draw={draw} />;
}
