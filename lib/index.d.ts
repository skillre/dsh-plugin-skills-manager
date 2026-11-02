import type { Context } from '@deepseek-ai/cordis';
import { Config } from './config.js';
import type { ManagerConfig } from './config.js';
import { SkillsManager } from './manager.js';
export { Config, SkillsManager };
export declare const name = "skillre-skills-manager";
export declare const inject: string[];
declare module '@deepseek-ai/cordis' {
    interface Context {
        skillreSkillsManager: SkillsManager;
    }
}
export declare function apply(ctx: Context, rawConfig?: Partial<ManagerConfig>): void;
