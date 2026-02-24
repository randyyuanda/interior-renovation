export interface HomeOwner {
  id: number;
  name: string;
  phone: string;
  propertyType: string;
  renoBudget: number;
  renoDate: string;
  keyCollected: boolean;
  interiorDesignerId?: number;
}

export interface HomeOwnerPayload {
  name: string;
  phone: string;
  propertyType: string;
  renoBudget: number;
  renoDate: string;
  keyCollected: boolean;
  interiorDesignerId?: number;
}
