/**
 * skill-almost-level.js
 *
 * Warn on senior player pages when the main skill is estimated
 * to be close to leveling up (high sublevel via PsicoTSI/TSI-wage).
 *
 * Hattrick skill bars show absolute skill level (e.g. 7/20), not
 * progress within the current denomination — exact sublevels are
 * not exposed on the page.
 *
 * @author davideneves
 */

'use strict';

Foxtrick.modules.SkillAlmostLevel = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails'],
	OPTIONS: ['OwnPlayersOnly'],
	CSS: Foxtrick.InternalPath + 'resources/css/skill-almost-level.css',

	/**
	 * Indices aligned with Foxtrick.psico.getMaxSkill /
	 * PsicoTSI skill vector [frm, sta, pm, w, sco, gk, ps, df, sp].
	 *
	 * @type {(string|null)[]}
	 */
	SKILL_KEYS: [
		null, null,
		'playmaking', 'winger', 'scoring', 'keeper', 'passing', 'defending', 'setPieces',
	],

	/**
	 * L10n keys for skill names (same order as SKILL_KEYS / PsicoTSI).
	 *
	 * @type {(string|null)[]}
	 */
	SKILL_L10N: [
		null, null,
		'Playmaking', 'Winger', 'Scoring', 'Keeper', 'Passing', 'Defending', 'Set_pieces',
	],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		if (Foxtrick.Pages.Player.wasFired(doc))
			return;
		if (!Foxtrick.Pages.Player.isSenior(doc))
			return;
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'OwnPlayersOnly') &&
			!Foxtrick.Pages.All.isOwn(doc))
			return;

		Foxtrick.util.currency.detect(doc).then(function() {
			module.analyze(doc);
		}, function(reason) {
			Foxtrick.log('SkillAlmostLevel: currency.detect aborted:', reason);
		}).catch(Foxtrick.catch(module));
	},

	/** @param {document} doc */
	analyze: function(doc) {
		const module = this;

		let skillsWithText = Foxtrick.Pages.Player.getSkillsWithText(doc);
		let skills = skillsWithText && skillsWithText.values;
		if (!skills)
			return;

		let age = Foxtrick.Pages.Player.getAge(doc);
		if (!age)
			return;

		let attrs = Foxtrick.Pages.Player.getAttributes(doc);
		if (!attrs)
			return;

		let wage = Foxtrick.Pages.Player.getWage(doc);

		/** @type {Player} */
		let player = {
			age: age,
			ageYears: age.years,
			tsi: Foxtrick.Pages.Player.getTsi(doc),
			salary: wage && wage.base,
			isAbroad: false,
			form: attrs.form,
			stamina: attrs.stamina,
			playmaking: skills.playmaking,
			winger: skills.winger,
			scoring: skills.scoring,
			keeper: skills.keeper,
			passing: skills.passing,
			defending: skills.defending,
			setPieces: skills.setPieces,
		};

		let pr = Foxtrick.modules.PsicoTSI.getPrediction(
			player, Foxtrick.util.currency.getRate());
		if (!pr || pr.limit !== 'High' || pr.undef)
			return;

		let skillKey = module.SKILL_KEYS[pr.maxSkill];
		if (!skillKey)
			return;

		let skillName = skillsWithText.names[skillKey] ||
			Foxtrick.L10n.getString(module.SKILL_L10N[pr.maxSkill]);

		module.highlightSkill(doc, skillName);
		module.showNote(doc, skillName, skillKey);
	},

	/**
	 * @param {document} doc
	 * @param {string}   skillName
	 */
	highlightSkill: function(doc, skillName) {
		const module = this;
		let needle = skillName.toLowerCase();

		let tables = doc.querySelectorAll(
			'.transferPlayerSkills table, .playerInfo table, #mainBody table');
		for (let table of tables) {
			for (let row of table.rows) {
				let [nameCell] = row.cells;
				if (!nameCell)
					continue;

				let label = nameCell.textContent.replace(':', '').trim().toLowerCase();
				if (label !== needle)
					continue;

				Foxtrick.addClass(row, 'ft-skill-almost-level-row');
				Foxtrick.makeFeaturedElement(row, module);
				return;
			}
		}
	},

	/**
	 * @param {document} doc
	 * @param {string}   skillName
	 * @param {string}   skillKey
	 */
	showNote: function(doc, skillName, skillKey) {
		const module = this;
		let noteId = 'ft-skill-almost-level';
		if (doc.getElementById(noteId))
			return;

		let template = Foxtrick.L10n.getString('SkillAlmostLevel.warning');
		let text = template.replace(/%s/g, skillName);

		let container = Foxtrick.createFeaturedElement(doc, module, 'div');
		container.textContent = text;

		let skillTable = doc.querySelector('.transferPlayerSkills') ||
			doc.querySelector('.playerInfo');
		let opts = skillTable
			? { at: skillTable }
			: {
				at: Foxtrick.getMBElement(doc, 'updBestLatest') ||
					Foxtrick.getMBElement(doc, 'updPlayerTabs'),
			};

		Foxtrick.util.note.add(doc, container, noteId, opts);

		if (skillKey)
			container.setAttribute('data-skill', skillKey);
	},
};
