export interface Player {
  id: string;
  name: string;
  team: string;
  color: string;
  currentPosition: { x: number; y: number };
  anchorPoints: Array<{ x: number; y: number }>;
  computedPath: Array<{ x: number; y: number }>;
}
