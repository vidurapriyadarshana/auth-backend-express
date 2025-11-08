import { Document } from "mongoose";

export interface IThreatment extends Document{
    name: string;
    description: string;
    duration: number;
    resources: string[]; 
    benifits: string[];
    imgUrl?: string;
}