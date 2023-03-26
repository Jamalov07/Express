import { Request } from 'express';

export interface ReqWithAdmin extends Request {
  admin: {
    id: number;
    is_active: boolean;
    is_creator: boolean;
  };
}
