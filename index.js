/// <reference types='../CTAutocomplete' />
/// <reference lib='es2015' />

import SkyblockUtilities from '../SkyblockUtilities/index';
import Location from '../SkyblockUtilities/enums/Location';
import Color from '../SkyblockUtilities/enums/Color';
import MCEntity from '../SkyblockUtilities/enums/MCEntity';
import SBSymbol from '../SkyblockUtilities/enums/SBSymbol';
import Utils from '../SkyblockUtilities/utils/Utils';
import request from '../requestV2/index';

const SharedMonsterAttributes = Java.type('net.minecraft.entity.SharedMonsterAttributes');

const ModuleName = 'GhostNametags';
const Version = JSON.parse(FileLib.read(`${Config.modulesFolder}/${ModuleName}/metadata.json`)).version;
const StartSeparator = `${Color.YELLOW}------------ ${Color.GOLD}${ModuleName} ${Color.YELLOW}------------${Color.LINE_BREAK}`;
const EndSeparator = `${Color.YELLOW}--------------------------------------`;

let creeperList = [];

checkForUpdates();

register('renderWorld', () => {
	creeperList.forEach(creeper => {
		drawNames(creeper);
	});
});

register('tick', () => {
    if (SkyblockUtilities.getLocation() === Location.THE_MIST) {
        let namesNew = [];
        World.getAllEntitiesOfType(MCEntity.CREEPER.class).forEach(creeper => {
            namesNew.push(creeper);
        });
        creeperList = namesNew;
    }
});

function drawNames(creeper) {
    if (Utils.getDistance(Player.getX(), Player.getY(), Player.getZ(), creeper.getX(), creeper.getY(), creeper.getZ()) <= 60) {
        const currentHealth = creeper.entity.func_110143_aJ(); // getHealth()
        const maxHealth = creeper.entity.func_110148_a(SharedMonsterAttributes.field_111267_a).func_111125_b(); // getEntityAttribute() | maxHealth | getBaseValue()
        const isRunic = maxHealth === 4000000;
        let bracketsColor = Color.DARK_GRAY;
        let lvlColor = Color.GRAY;
        let nameColor = Color.RED;
        let currentHealthColor = currentHealth < maxHealth / 2 ? Color.YELLOW : Color.GREEN;
        let maxHealthColor = Color.GREEN;
        if (isRunic) {
            bracketsColor = Color.DARK_PURPLE;
            lvlColor = Color.LIGHT_PURPLE;
            nameColor = Color.DARK_PURPLE;
            currentHealthColor = Color.LIGHT_PURPLE;
            maxHealthColor = Color.DARK_PURPLE;
        }
        const name = `${bracketsColor}[${lvlColor}Lv250${bracketsColor}] ${nameColor + (isRunic ? 'Runic' : '')} Ghost ${currentHealthColor + formatHealth(currentHealth) + Color.WHITE}/${maxHealthColor + formatHealth(maxHealth) + Color.RED + SBSymbol.HEALTH}`.replace(/&/g, '§');
        Utils.drawString(name, creeper.getX(), creeper.getY() + 2.5, creeper.getZ(), Renderer.RED, false, 0.05, false, false);
    }
}

function formatHealth(health) {
    if (health >= 1000000) {
        const hp = round(health, -5);
        const k = hp.charAt(1);
        return hp.charAt(0) + (k != '0' ? '.' + k : '') + 'M';
    } else if (health < 1000000) {
        return round(health, -3).replace('000', '') + 'k';
    }
}

function round(number, decimalPlaces) {
    const factorOfTen = Math.pow(10, decimalPlaces);
    return (Math.round(number * factorOfTen) / factorOfTen).toFixed();
}

function checkForUpdates() {
	request({
		url: `https://raw.githubusercontent.com/Steinente/${ModuleName}/master/metadata.json`,
		json: true
	}).then(response => {
		if (JSON.parse(JSON.stringify(response)).version !== Version) {
			const Link = `https://github.com/Steinente/${ModuleName}/releases/latest`;
			const MessageStr = new Message(
				StartSeparator,
				`${Color.RED}New version available! Download at:`,
				new TextComponent(`${Color.BLUE}${Link}${Color.LINE_BREAK}`).setClick('open_url', `${Link}`),
				EndSeparator
			);
			ChatLib.chat(MessageStr);
		}
	});
}