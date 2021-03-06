import uniqueId from "lodash/uniqueId";

export class ShapePoint {
  public id!: string;
  public x!: number;
  public y!: number;

  constructor(x: number, y: number) {
    this.id = uniqueId("point__");
    this.x = x;
    this.y = y;
  }

  public copy(): ShapePoint {
    return new ShapePoint(this.x, this.y);
  }
}
