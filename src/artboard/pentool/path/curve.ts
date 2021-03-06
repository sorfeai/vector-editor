import uniqueId from "lodash/uniqueId";
import { ShapePoint } from "./point";
import * as styles from "../styles";
import { IPathSettings } from "../types";

interface ICurveRenderParams {
  ctx: CanvasRenderingContext2D;
  settings: IPathSettings;
  index: number;
  length: number;
  drawing: boolean;
}

export class Curve {
  public id!: string;
  public previous: Curve | null = null;
  public next: Curve | null = null;
  public startControlMoved = false;
  public startPoint!: ShapePoint;
  public startControlPoint!: ShapePoint;
  public endControlMoved = false;
  public endPoint!: ShapePoint;
  public endControlPoint!: ShapePoint;
  public completed = false;
  public curveVisible = true;

  constructor(startPoint: ShapePoint, previous: Curve | null = null) {
    this.id = uniqueId("curve__");
    this.previous = previous;
    this.startPoint = startPoint;
    this.startControlPoint = startPoint.copy();
    this.endPoint = startPoint.copy();
    this.endControlPoint = startPoint.copy();
  }

  public render(params: ICurveRenderParams) {
    const { ctx, settings, index, length, drawing } = params;

    if (settings.strokeWidth !== 0) {
      this.renderStroke(ctx, settings.strokeColor, settings.strokeWidth);
    }

    this.renderContour(ctx);

    if (drawing) {
      this.renderControlLines(ctx, index, length);
    }

    this.renderPoints(ctx);

    if (drawing) {
      this.renderControlPoints(ctx, index, length);
    }
  }

  public moveStartControlPoint(x: number, y: number) {
    this.startControlPoint.x = x;
    this.startControlPoint.y = y;
  }

  public moveEnvControlPoint(x: number, y: number) {
    this.endControlPoint.x = x;
    this.endControlPoint.y = y;
  }

  public moveEndPoint(x: number, y: number) {
    this.endPoint.x = x;
    this.endPoint.y = y;
  }

  public moveEndControlPoint(x: number, y: number) {
    this.endControlPoint.x = x;
    this.endControlPoint.y = y;
  }

  private renderStroke(
    ctx: CanvasRenderingContext2D,
    color: string,
    width: number
  ) {
    const {
      curveVisible,
      startPoint,
      startControlPoint,
      endPoint,
      endControlPoint
    } = this;

    if (!curveVisible || !this.completed) return;

    ctx.lineWidth = width;
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.bezierCurveTo(
      startControlPoint.x,
      startControlPoint.y,
      endControlPoint.x,
      endControlPoint.y,
      endPoint.x,
      endPoint.y
    );
    ctx.stroke();
  }

  private renderContour(ctx: CanvasRenderingContext2D) {
    const {
      curveVisible,
      startPoint,
      startControlPoint,
      endPoint,
      endControlPoint
    } = this;

    if (!curveVisible) return;

    ctx.lineWidth = styles.contour.width;
    ctx.strokeStyle = this.completed
      ? styles.contour.color
      : styles.contour.colorPotential;

    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.bezierCurveTo(
      startControlPoint.x,
      startControlPoint.y,
      endControlPoint.x,
      endControlPoint.y,
      endPoint.x,
      endPoint.y
    );
    ctx.stroke();
  }

  private renderControlLines(
    ctx: CanvasRenderingContext2D,
    index: number,
    length: number
  ) {
    if (index < length - 2) return;

    const {
      startControlMoved: startModified,
      endControlMoved: endModified,
      startPoint,
      startControlPoint,
      endPoint,
      endControlPoint
    } = this;

    ctx.lineWidth = styles.controlLine.width;
    ctx.strokeStyle = styles.controlLine.color;

    ctx.beginPath();

    if (startModified) {
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(startControlPoint.x, startControlPoint.y);
    }
    if (endModified) {
      ctx.moveTo(endPoint.x, endPoint.y);
      ctx.lineTo(endControlPoint.x, endControlPoint.y);
    }

    ctx.stroke();
  }

  private renderPoints(ctx: CanvasRenderingContext2D) {
    const { startPoint, endPoint } = this;

    ctx.lineWidth = styles.point.width;
    ctx.strokeStyle = styles.point.color;
    ctx.fillStyle = styles.point.fill;

    this.renderPoint(ctx, startPoint);
    this.renderPoint(ctx, endPoint);
  }

  private renderControlPoints(
    ctx: CanvasRenderingContext2D,
    index: number,
    length: number
  ) {
    if (index < length - 2) return;

    const {
      startControlMoved: startModified,
      endControlMoved: endModified,
      startControlPoint,
      endControlPoint
    } = this;

    ctx.fillStyle = styles.controlPoint.fill;

    if (startModified) {
      this.renderControlPoint(ctx, startControlPoint);
    }
    if (endModified) {
      this.renderControlPoint(ctx, endControlPoint);
    }
  }

  private renderPoint(ctx: CanvasRenderingContext2D, point: ShapePoint) {
    ctx.beginPath();
    ctx.arc(
      point.x,
      point.y,
      styles.point.radius,
      styles.point.arc1,
      styles.point.arc2,
      true
    );
    ctx.fill();
    ctx.stroke();
  }

  private renderControlPoint(ctx: CanvasRenderingContext2D, point: ShapePoint) {
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate((45 * Math.PI) / 180);

    const { stroke, fill, size, strokeWidth } = styles.controlPoint;

    // stroke rect
    ctx.fillStyle = stroke;
    ctx.fillRect(
      -size / 2 - strokeWidth,
      -size / 2 - strokeWidth,
      size + strokeWidth * 2,
      size + strokeWidth * 2
    );

    // fill rect
    ctx.fillStyle = fill;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    ctx.restore();
  }
}
