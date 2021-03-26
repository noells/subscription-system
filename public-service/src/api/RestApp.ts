import {Application} from 'express';

export interface RestApp {
	getApp(): Application;
}
