export type NavigationTab = 'experience' | 'collection';

export interface ProductItem {
  id: string;
  name: string;
  subtitle: string;
  abv: string;
  volume: string;
  number: string;
  color: string;
  bgColor: string;
  modelAsset?: string;
  labelTexture?: string;
}

export interface AudioTrackConfig {
  id: string;
  path: string;
  baseGain?: number;
  effectChainId?: string;
  loop?: boolean;
}

export interface WebGLSceneConfig {
  id: string;
  title: string;
  cameraFov?: number;
  backgroundShader?: string;
}
