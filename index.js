/// <reference types='../CTAutocomplete' />
/// <reference lib='es2015' />

import SkyblockUtilities from '../SkyblockUtilities/index';
import Location from '../SkyblockUtilities/enums/Location';
import Color from '../SkyblockUtilities/enums/Color';
import MCEntity from '../SkyblockUtilities/enums/MCEntity';
import SBSymbol from '../SkyblockUtilities/enums/SBSymbol';
import Utils from '../SkyblockUtilities/utils/Utils';
import request from '../requestV2/index';

const AxisAlignedBB = Java.type('net.minecraft.util.AxisAlignedBB');
const SharedMonsterAttributes = Java.type('net.minecraft.entity.SharedMonsterAttributes');

const ModuleName = 'GhostNametags';
const Version = JSON.parse(FileLib.read(`${Config.modulesFolder}/${ModuleName}/metadata.json`)).version;
const StartSeparator = `${Color.YELLOW}------------ ${Color.GOLD}${ModuleName} ${Color.YELLOW}------------${Color.LINE_BREAK}`;
const EndSeparator = `${Color.YELLOW}--------------------------------------`;

let creeperList = [];

checkForUpdates();

register('renderWorld', () => {
    if (SkyblockUtilities.getLocation() !== Location.THE_MIST) return;
	creeperList.forEach(creeper => drawName(creeper));
});

register('worldUnload', () => {
	creeperList = [];
});

register('tick', () => {
    if (SkyblockUtilities.getLocation() !== Location.THE_MIST) return;
    const radius = 60;
    const scanArea = new AxisAlignedBB(
		Player.getX() + radius,
		Player.getY() + radius >= 255 ? 255 : Player.getY() + radius,
		Player.getZ() + radius,
		Player.getX() - radius,
		Player.getY() - radius <= 0 ? 0 : Player.getY() - radius,
		Player.getZ() - radius
	);
    let namesNew = [];
    World.getWorld().func_72872_a(MCEntity.CREEPER.class, scanArea).forEach(creeper => namesNew.push(creeper)); // getEntitiesWithinAABB()
    creeperList = namesNew;
});

function drawName(creeper) {
    const entity = new Entity(creeper);
    if (Utils.getDistance(Player.getX(), Player.getY(), Player.getZ(), entity.getX(), entity.getY(), entity.getZ()) > 60) return;
    const currentHealth = creeper.func_110143_aJ(); // getHealth()
    const maxHealth = creeper.func_110148_a(SharedMonsterAttributes.field_111267_a).func_111125_b(); // getEntityAttribute() | maxHealth | getBaseValue()
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
    const name = `${bracketsColor}[${lvlColor}Lv250${bracketsColor}] ${nameColor + (isRunic ? 'Runic ' : '')}Ghost ${currentHealthColor + Utils.transformToSuffixedNumber(currentHealth) + Color.WHITE}/${maxHealthColor + Utils.transformToSuffixedNumber(maxHealth) + Color.RED + SBSymbol.HEALTH}`.replace(/&/g, '§');
    Utils.drawString(name, entity.getX(), entity.getY() + 2.5, entity.getZ(), 0, false, 0.05, false, false);
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