import { I, M, Decode, DataUtil, Util, Encode } from 'ts/lib';

const Commands = require('lib/pb/protos/commands_pb');
const Model = require('lib/pkg/lib/pb/model/protos/models_pb.js');
const Rpc = Commands.Rpc;

const Mapper = {

	BlockType: (v: number): I.BlockType => {
		let t = I.BlockType.Empty;
		let V = Model.Block.ContentCase;

		if (v == V.SMARTBLOCK)			 t = I.BlockType.Page;
		if (v == V.TEXT)				 t = I.BlockType.Text;
		if (v == V.FILE)				 t = I.BlockType.File;
		if (v == V.LAYOUT)				 t = I.BlockType.Layout;
		if (v == V.DIV)					 t = I.BlockType.Div;
		if (v == V.BOOKMARK)			 t = I.BlockType.Bookmark;
		if (v == V.LINK)				 t = I.BlockType.Link;
		if (v == V.DATAVIEW)			 t = I.BlockType.Dataview;
		if (v == V.RELATION)			 t = I.BlockType.Relation;
		if (v == V.FEATUREDRELATIONS)	 t = I.BlockType.Featured;
		if (v == V.LATEX)				 t = I.BlockType.Latex;
		if (v == V.TABLEOFCONTENTS)		 t = I.BlockType.TableOfContents;
		return t;
	},

	From: {

		Account: (obj: any): I.Account => {
			return {
				id: obj.getId(),
			};
		},

		AccountConfig: (obj: any): I.AccountConfig => {
			return {
				allowSpaces: obj.getEnablespaces(),
			};
		},
		
		ObjectInfo: (obj: any): I.PageInfo => {
			return {
				id: obj.getId(),
				details: Decode.decodeStruct(obj.getDetails()),
				snippet: obj.getSnippet(),
				hasInboundLinks: obj.getHasinboundlinks(),
			};
		},

		Record: (obj: any): any => {
			return Decode.decodeStruct(obj);
		},

		Range: (obj: any): I.TextRange => {
			return {
				from: obj.getFrom(),
				to: obj.getTo(),
			};
		},

		Mark: (obj: any): I.Mark => {
			return {
				type: obj.getType(),
				param: obj.getParam(),
				range: Mapper.From.Range(obj.getRange()),
			};
		},

		PreviewLink: (obj: any) => {
            return {
                type: obj.getType(),
                title: obj.getTitle(),
                description: obj.getDescription(),
                faviconUrl: obj.getFaviconurl(),
                imageUrl: obj.getImageurl(),
                url: obj.getUrl(),
            };
        },

		Details: (obj: any): any => {
			return {
				id: obj.getId(),
				details: Decode.decodeStruct(obj.getDetails()),
			};
		},

		BlockLayout: (obj: any) => {
			return {
				style: obj.getStyle(),
			};
		},

		BlockDiv: (obj: any) => {
			return {
				style: obj.getStyle(),
			};
		},

		BlockLink: (obj: any) => {
			return {
				style: obj.getStyle(),
				targetBlockId: obj.getTargetblockid(),
				fields: Decode.decodeStruct(obj.getFields()),
			};
		},

		BlockBookmark: (obj: any) => {
			return {
				url: obj.getUrl(),
				title: obj.getTitle(),
				description: obj.getDescription(),
				imageHash: obj.getImagehash(),
				faviconHash: obj.getFaviconhash(),
				type: obj.getType(),
			};
		},

		BlockText: (obj: any) => {
			return {
				text: obj.getText(),
				style: obj.getStyle(),
				checked: obj.getChecked(),
				color: obj.getColor(),
				marks: (obj.getMarks().getMarksList() || []).map(Mapper.From.Mark),
			};
		},

		BlockFile: (obj: any) => {
			return {
				hash: obj.getHash(),
				name: obj.getName(),
				type: obj.getType(),
				style: obj.getStyle(),
				mime: obj.getMime(),
				size: obj.getSize(),
				addedAt: obj.getAddedat(),
				state: obj.getState(),
			};
		},

		BlockDataview: (obj: any) => {
			return {
				sources: obj.getSourceList(),
				views: (obj.getViewsList() || []).map(Mapper.From.View),
				relations: (obj.getRelationsList() || []).map(Mapper.From.Relation),
			};
		},

		BlockRelation: (obj: any) => {
			return {
				key: obj.getKey(),
			};
		},

		BlockLatex: (obj: any) => {
			return {
				text: obj.getText(),
			};
		},
	
		Block: (obj: any): I.Block => {
			let type = Mapper.BlockType(obj.getContentCase());
			let fn = 'get' + Util.ucFirst(type);
			let content = obj[fn] ? obj[fn]() : {};
	
			let item: I.Block = {
				id: obj.getId(),
				type: type,
				childrenIds: obj.getChildrenidsList() || [],
				fields: Decode.decodeStruct(obj.getFields()),
				content: {} as any,
				align: obj.getAlign(),
				bgColor: obj.getBackgroundcolor(),
			};
	
			if (type == I.BlockType.Layout) {
				item.content = Mapper.From.BlockLayout(content);
			};
	
			if (type == I.BlockType.Link) {
				item.content = Mapper.From.BlockLink(content);
			};
	
			if (type == I.BlockType.Div) {
				item.content = Mapper.From.BlockDiv(content);
			};
	
			if (type == I.BlockType.Bookmark) {
				item.content = Mapper.From.BlockBookmark(content);
			};
	
			if (type == I.BlockType.Text) {
				item.content = Mapper.From.BlockText(content);
			};
	
			if (type == I.BlockType.File) {
				item.content = Mapper.From.BlockFile(content);
			};
	
			if (type == I.BlockType.Dataview) {
				item.content = Mapper.From.BlockDataview(content);
			};

			if (type == I.BlockType.Relation) {
				item.content = Mapper.From.BlockRelation(content);
			};

			if (type == I.BlockType.Latex) {
				item.content = Mapper.From.BlockLatex(content);
			};
	
			return item;
		},

		Restrictions: (obj: any): any => {
			if (!obj) {
				return {
					object: [],
					dataview: [],
				};
			};

			return {
				object: obj.getObjectList() || [],
				dataview: (obj.getDataviewList() || []).map(Mapper.From.RestrictionsDataview),
			};
		},

		RestrictionsDataview: (obj: any): any => {
			return {
				blockId: obj.getBlockid(),
				restrictions: obj.getRestrictionsList() || [],
			};
		},

		ObjectType: (obj: any): I.ObjectType => {
			return {
				id: obj.getUrl(),
				name: obj.getName(),
				description: obj.getDescription(),
				layout: obj.getLayout(),
				iconEmoji: obj.getIconemoji(),
				isHidden: obj.getHidden(),
				isArchived: obj.getIsarchived(),
				isReadonly: obj.getReadonly(),
				types: obj.getTypesList(),
				relations: (obj.getRelationsList() || []).map(Mapper.From.Relation),
			};
		},

		Relation: (obj: any): I.Relation => {
			return {
				objectId: '',
				relationKey: obj.getKey(),
				format: obj.getFormat(),
				name: obj.getName(),
				dataSource: obj.getDatasource(),
				isHidden: obj.getHidden(),
				isReadonlyValue: obj.getReadonly(),
				isReadonlyRelation: obj.getReadonlyrelation(),
				maxCount: obj.getMaxcount(),
				objectTypes: obj.getObjecttypesList(),
				scope: obj.getScope(),
				selectDict: (obj.getSelectdictList() || []).map(Mapper.From.SelectOption),
			};
		},

		SelectOption: (obj: any) => {
			return {
				id: obj.getId(),
				text: obj.getText(),
				color: obj.getColor(),
				scope: obj.getScope(),
			};
		},

		ViewRelation: (obj: any) => {
            return {
                relationKey: obj.getKey(),
                isVisible: obj.getIsvisible(),
                width: obj.getWidth(),
				includeTime: obj.getDateincludetime(),
                timeFormat: obj.getTimeformat(),
				dateFormat: obj.getDateformat(),
            };
        },

		Filter: (obj: any): I.Filter => {
			return {
				relationKey: obj.getRelationkey(),
				operator: obj.getOperator(),
				condition: obj.getCondition(),
				value: obj.hasValue() ? Decode.decodeValue(obj.getValue()) : null,
			};
		},

		Sort: (obj: any): I.Sort => {
			return {
				relationKey: obj.getRelationkey(),
				type: obj.getType(),
			};
		},

		View: (obj: any): I.View => {
			return {
				id: obj.getId(),
				type: obj.getType(),
				name: obj.getName(),
				coverRelationKey: obj.getCoverrelationkey(),
				coverFit: obj.getCoverfit(),
				cardSize: obj.getCardsize(),
				hideIcon: obj.getHideicon(),
				sorts: obj.getSortsList().map(Mapper.From.Sort),
				filters: obj.getFiltersList().map(Mapper.From.Filter),
				relations: obj.getRelationsList().map(Mapper.From.ViewRelation),
			};
		},

		HistoryVersion: (obj: any): I.HistoryVersion => {
			return {
				id: obj.getId(),
				previousIds: obj.getPreviousidsList() || [],
				authorId: obj.getAuthorid(),
				authorName: obj.getAuthorname(),
				groupId: obj.getGroupid(),
				time: obj.getTime(),
			};
		},

		ThreadSummary: (obj: any) => {
            return {
                status: Number(obj.getStatus() || I.ThreadStatus.Unknown),
            };
        },

		ThreadCafe: (obj: any) => {
            return {
                status: Number(obj.getStatus() || I.ThreadStatus.Unknown),
                lastPulled: obj.getLastpulled(),
                lastPushSucceed: obj.getLastpushsucceed(),
				files: Mapper.From.ThreadFiles(obj.getFiles()),
            };
        },

		ThreadFiles: (obj: any) => {
            return {
				pinning: obj.getPinning(),
				pinned: obj.getPinned(),
				failed: obj.getFailed(),
				updated: obj.getUpdated(),
            };
        },

		ThreadDevice: (obj: any) => {
            return {
                name: obj.getName(),
				online: obj.getOnline(),
                lastPulled: obj.getLastpulled(),
                lastEdited: obj.getLastedited(),
            };
        },

		ThreadAccount: (obj: any) => {
            return {
				id: obj.getId(),
				name: obj.getName(),
				imageHash: obj.getImagehash(),
				online: obj.getOnline(),
                lastPulled: obj.getLastpulled(),
                lastEdited: obj.getLastedited(),
				devices: (obj.getDevicesList() || []).map(Mapper.From.ThreadDevice),
            };
        },

		GraphEdge: (obj: any) => {
            return {
				type: obj.getType(),
				source: obj.getSource(),
				target: obj.getTarget(),
				name: obj.getName(),
				description: obj.getDescription(),
				iconImage: obj.getIconimage(),
				iconEmoji: obj.getIconemoji(),
				isHidden: obj.getHidden(),
            };
        },

		GraphNode: (obj: any) => {
            return {
                id: obj.getId(),
				type: obj.getType(),
				name: obj.getName(),
				layout: obj.getLayout(),
				description: obj.getDescription(),
				snippet: obj.getSnippet(),
				iconImage: obj.getIconimage(),
				iconEmoji: obj.getIconemoji(),
				done: obj.getDone(),
				relationFormat: obj.getRelationformat(),
            };
        },

		UnsplashPicture: (obj: any) => {
			return {
                id: obj.getId(),
				url: obj.getUrl(),
				artist: obj.getArtist(),
				artistUrl: obj.getArtisturl(),
            };
		},

    },

	//------------------------------------------------------------

	To: {

		Range: (obj: any) => {
			let ret = new Model.Range();
			ret.setFrom(obj.from);
			ret.setTo(obj.to);
			return ret;
		},

		Mark: (obj: any) => {
			const item = new Model.Block.Content.Text.Mark();
			item.setType(obj.type);
			item.setParam(obj.param);
			item.setRange(Mapper.To.Range(obj.range));
			return item;
		},

		Details: (obj: any) => {
			const item = new Rpc.Block.Set.Details.Detail();
			item.setKey(obj.key);
			item.setValue(Encode.encodeValue(obj.value));
			return item;
		},

		Fields: (obj: any) => {
			const item = new Rpc.BlockList.Set.Fields.Request.BlockField();

			item.setBlockid(obj.blockId);
			item.setFields(Encode.encodeStruct(obj.fields || {}));

			return item;
		},

		BlockLayout: (obj: any) => {
			const content = new Model.Block.Content.Layout();
			
			content.setStyle(obj.style);

			return content;
		},

		BlockText: (obj: any) => {
			const marks = (obj.marks || []).map(Mapper.To.Mark);
			const content = new Model.Block.Content.Text();

			content.setText(obj.text);
			content.setStyle(obj.style);
			content.setChecked(obj.checked);
			content.setColor(obj.color);
			content.setMarks(new Model.Block.Content.Text.Marks().setMarksList(marks));

			return content;
		},

		BlockFile: (obj: any) => {
			const content = new Model.Block.Content.File();
	
			content.setHash(obj.hash);
			content.setName(obj.name);
			content.setType(obj.type);
			content.setMime(obj.mime);
			content.setSize(obj.size);
			content.setAddedat(obj.addedAt);
			content.setState(obj.state);

			return content;
		},

		BlockBookmark: (obj: any) => {
			const content = new Model.Block.Content.Bookmark();
	
			content.setUrl(obj.url);
			content.setTitle(obj.title);
			content.setDescription(obj.description);
			content.setImagehash(obj.imageHash);
			content.setFaviconhash(obj.faviconHash);
			content.setType(obj.type);

			return content;
		},

		BlockLink: (obj: any) => {
			const content = new Model.Block.Content.Link();
	
			content.setStyle(obj.style);
			content.setTargetblockid(obj.targetBlockId);

			return content;
		},

		BlockDiv: (obj: any) => {
			const content = new Model.Block.Content.Div();

			content.setStyle(obj.style);

			return content;
		},

		BlockRelation: (obj: any) => {
			const content = new Model.Block.Content.Relation();

			content.setKey(obj.key);

			return content;
		},

		BlockLatex: (obj: any) => {
			const content = new Model.Block.Content.Latex();
	
			content.setText(obj.text);

			return content;
		},

		BlockDataview: (obj: any) => {
			const content = new Model.Block.Content.Dataview();
	
			content.setViewsList(obj.views.map(Mapper.To.View));
	
			return content;
		},

		Block: (obj: any) => {
			obj.content = Util.objectCopy(obj.content || {});
	
			let block = new Model.Block();
			let content: any = null;
	
			block.setId(obj.id);
			block.setAlign(obj.align);
			block.setBackgroundcolor(obj.bgColor);
	
			if (obj.childrenIds) {
				block.setChildrenidsList(obj.childrenIds);
			};
	
			if (obj.fields) {
				block.setFields(Encode.encodeStruct(obj.fields || {}));
			};

			if (obj.type == I.BlockType.Layout) {
                block.setLayout(Mapper.To.BlockLayout(obj.content));
            };
	
			if (obj.type == I.BlockType.Text) {
				block.setText(Mapper.To.BlockText(obj.content));
			};
	
			if (obj.type == I.BlockType.File) {
				block.setFile(Mapper.To.BlockFile(obj.content));
			};
	
			if (obj.type == I.BlockType.Bookmark) {
				block.setBookmark(Mapper.To.BlockBookmark(obj.content));
			};

			if (obj.type == I.BlockType.Link) {
				block.setLink(Mapper.To.BlockLink(obj.content));
			};

			if (obj.type == I.BlockType.Div) {
				block.setDiv(Mapper.To.BlockDiv(obj.content));
			};

			if (obj.type == I.BlockType.Relation) {
				block.setRelation(Mapper.To.BlockRelation(obj.content));
			};

			if (obj.type == I.BlockType.Latex) {
				block.setLatex(Mapper.To.BlockLatex(obj.content));
			};

			if (obj.type == I.BlockType.Dataview) {
				block.setDataview(Mapper.To.BlockDataview(obj.content));
			};

			if (obj.type == I.BlockType.TableOfContents) {
				content = new Model.Block.Content.TableOfContents();
	
				block.setTableofcontents(content);
			};

			return block;
		},

		ViewRelation: (obj: any) => {
			const item = new Model.Block.Content.Dataview.Relation();

			item.setKey(obj.relationKey);
			item.setIsvisible(obj.isVisible);
			item.setWidth(obj.width);
			item.setDateincludetime(obj.includeTime);
			item.setTimeformat(obj.timeFormat);
			item.setDateformat(obj.dateFormat);

			return item;
		},

		Filter: (obj: any) => {
			const item = new Model.Block.Content.Dataview.Filter();
			
			item.setRelationkey(obj.relationKey);
			item.setOperator(obj.operator);
			item.setCondition(obj.condition);
			item.setValue(Encode.encodeValue(obj.value));

			return item;
		},

		Sort: (obj: any) => {
			const item = new Model.Block.Content.Dataview.Sort();
			
			item.setRelationkey(obj.relationKey);
			item.setType(obj.type);

			return item;
		},

		View: (obj: I.View) => {
			obj = new M.View(Util.objectCopy(obj));
			
			const item = new Model.Block.Content.Dataview.View();

			item.setId(obj.id);
			item.setName(obj.name);
			item.setType(obj.type);
			item.setCoverrelationkey(obj.coverRelationKey);
			item.setCoverfit(obj.coverFit);
			item.setCardsize(obj.cardSize);
			item.setHideicon(obj.hideIcon);
			item.setRelationsList(obj.relations.map(Mapper.To.ViewRelation));
			item.setFiltersList(obj.filters.map(Mapper.To.Filter));
			item.setSortsList(obj.sorts.map(Mapper.To.Sort));

			return item;
		},

		PasteFile: (obj: any) => {
			const item = new Rpc.Block.Paste.Request.File();

			item.setName(obj.name);
			item.setLocalpath(obj.path);

			return item;
		},

		ObjectType: (obj: any) => {
			const item = new Model.ObjectType();
			
			item.setUrl(obj.id);
			item.setName(obj.name);
			item.setLayout(obj.layout);
			item.setIconemoji(obj.iconEmoji);
			item.setHidden(obj.isHidden);
			item.setRelationsList((obj.relations || []).map(Mapper.To.Relation));

			return item;
		},

		Relation: (obj: any) => {
			const item = new Model.Relation();
			
			item.setKey(obj.relationKey);
			item.setFormat(obj.format);
			item.setName(obj.name);
			item.setDefaultvalue(obj.defaultValue);
			item.setDatasource(obj.dataSource);
			item.setHidden(obj.isHidden);
			item.setReadonly(obj.isReadonly);
			item.setMaxcount(obj.maxCount);
			item.setObjecttypesList(obj.objectTypes);
			item.setSelectdictList((obj.selectDict || []).map(Mapper.To.SelectOption));

			return item;
		},

		SelectOption: (obj: any) => {
			const item = new Model.Relation.Option();

			item.setId(obj.id);
			item.setText(obj.text);
			item.setColor(obj.color);

			return item;
		},

	}

};

export default Mapper;