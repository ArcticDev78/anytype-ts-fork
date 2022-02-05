import { observable, action, set, intercept, makeObservable } from 'mobx';
import { I, Relation, DataUtil, translate } from 'ts/lib';

const Constant = require('json/constant.json');

interface Detail {
	relationKey: string;
	value: any;
};

class DetailStore {

    public map: Map<string, Map<string, Detail[]>> = new Map();

    constructor() {
        makeObservable(this, {
            set: action,
            update: action,
            delete: action
        });
    };

    set (rootId: string, details: any[]) {
		let map = this.map.get(rootId);

		if (!map) {
			map = observable.map(new Map());
		};

		for (let item of details) {
			const list: Detail[] = [];
			for (let k in item.details) {
				const el = { relationKey: k, value: item.details[k] };
				makeObservable(el, { value: observable });

				intercept(el as any, (change: any) => { 
					return (change.newValue === el[change.name] ? null : change); 
				});

				list.push(el);
			};
			map.set(item.id, list);
		};

		this.map.set(rootId, map);
	};

    update (rootId: string, item: any, clear: boolean) {
		if (!item || !item.id || !item.details) {
			return;
		};

		let map = this.map.get(rootId);
		let createMap = false;
		let createList = false;

		if (!map) {
			map = observable.map(new Map());
			createMap = true;
		} else 
		if (clear) {
			map.delete(item.id);
		};

		let list = map.get(item.id);
		if (!list) {
			list = [];
			createList = true;
		};

		for (let k in item.details) {
			let el = list.find((it: Detail) => { return it.relationKey == k; });
			if (el) {
				set(el, { value: item.details[k] });
			} else {
				el = { relationKey: k, value: item.details[k] };
				makeObservable(el, { value: observable });
				list.push(el);
			};

			intercept(el as any, (change: any) => { 
				return (change.newValue === el[change.name] ? null : change); 
			});

			if (createList) {
				map.set(item.id, list);
			};
		};

		if (createMap) {
			this.map.set(rootId, map);
		};
	};

    delete (rootId: string, id: string, keys: string[]) {
		let map = this.map.get(rootId) || new Map();
		let list = this.getArray(rootId, id);

		list = list.filter((it: Detail) => { return keys.indexOf(it.relationKey) < 0 });
		map.set(id, list);
	};

	getArray (rootId: string, id: string): any[] {
		let map = this.map.get(rootId) || new Map();
		return map.get(id) || [];
	};

    get (rootId: string, id: string, keys?: string[], forceKeys?: boolean): any {
		let list = this.getArray(rootId, id);
		if (!list.length) {
			return { id, _empty_: true };
		};
		
		if (keys) {
			if (!forceKeys) {
				keys = keys.concat(Constant.defaultRelationKeys);
			};
			list = list.filter((it: Detail) => { return keys.includes(it.relationKey); });
		};

		let object: any = Object.fromEntries(list.map(it => [ it.relationKey, it.value ]));
		let layout = Number(object.layout) || I.ObjectLayout.Page;
		let name = String(object.name || DataUtil.defaultName('page'));
		let snippet = String(object.snippet || '').replace(/\n/g, ' ');

		if (layout == I.ObjectLayout.Note) {
			object.coverType = I.CoverType.None;
			object.coverId = '';
			object.iconEmoji = '';
			object.iconImage = '';

			name = snippet;
		};

		if (object.isDeleted) {
			name = translate('commonDeleted');
		};

		return {
			...object,
			id,
			name,
			layout,
			snippet,
			type: Relation.getStringValue(object.type),
			iconImage: Relation.getStringValue(object.iconImage),
			layoutAlign: Number(object.layoutAlign) || I.BlockAlign.Left,
			recommendedLayout: Number(object.recommendedLayout) || I.ObjectLayout.Page,
			relationFormat: Number(object.relationFormat) || I.RelationType.LongText,
			coverX: Number(object.coverX) || 0,
			coverY: Number(object.coverY) || 0,
			coverScale: Number(object.coverScale) || 0,
		};
	};

    clear (rootId: string) {
		this.map.delete(rootId);
	};

    clearAll () {
		this.map = new Map();
	};
};

export let detailStore: DetailStore = new DetailStore();
