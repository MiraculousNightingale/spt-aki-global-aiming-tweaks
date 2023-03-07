import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { Aiming } from "@spt-aki/models/eft/common/IGlobals";
import { DependencyContainer } from "tsyringe";

import modConfig from "../config/config.json";
import { VerboseLogger } from "./verbose_logger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { LogBackgroundColor } from "@spt-aki/models/spt/logging/LogBackgroundColor";
import { Applicator } from "./applicator";

class GlobalAimingTweaks implements IPostDBLoadMod 
{
    public postDBLoad(container: DependencyContainer): void 
    {
        const logger = new VerboseLogger(container);
        const applicator = new Applicator(logger);

        logger.explicitLog("Global Aiming Tweaks: Starting...", LogTextColor.BLACK, LogBackgroundColor.WHITE);

        logger.explicitInfo("Initialization...");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const tables = databaseServer.getTables();
        const aiming: Aiming = tables.globals.config.Aiming;

        // Check if RecoilCrank is in the multipliers section
        // A pretty specific check but i suppose it should be left here for now
        if ("RecoilCrank" in modConfig.multiply) 
        {
            logger.explicitError("[Error] Recoil crank is boolean and can't be multiplied. Remove it from the multipliers section in the config.");
            return;
        }

        // Multipliers
        if (modConfig.multiply != null && Object.keys(modConfig.multiply).length > 0)
        {
            logger.explicitInfo("Applying multipliers...");
            const changeCount = applicator.tryToApplyAllMultipliers(aiming, modConfig.multiply);
            logger.explicitInfo(`Made ${changeCount} changes after applying multipliers.`);
        }

        // Set Values
        if (modConfig.multiply != null && Object.keys(modConfig.set).length > 0)
        {
            logger.explicitInfo("Applying set values...");
            const changeCount = applicator.tryToApplyAllValues(aiming, modConfig.set);
            logger.explicitInfo(`Made ${changeCount} changes after applying set values.`);
        }
    
        logger.explicitLog("Global Aiming Tweaks: Completed", LogTextColor.BLACK, LogBackgroundColor.WHITE);
    }
}

module.exports = { mod: new GlobalAimingTweaks() };