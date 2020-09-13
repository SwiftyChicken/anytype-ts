import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Icon, Button, Title, Label, Cover, Textarea, Input, Loader, Smile, Error, Pin } from 'ts/component';
import { I, C, Storage, Key, Util, DataUtil } from 'ts/lib';
import { authStore, blockStore, commonStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends I.Popup, RouteComponentProps<any> {};

interface State {
	page: string;
	loading: boolean;
	error: string;
};

const { dialog } = window.require('electron').remote;
const $ = require('jquery');
const Constant: any = require('json/constant.json');
const sha1 = require('sha1');

@observer
class PopupSettings extends React.Component<Props, State> {

	phraseRef: any = null;
	state = {
		page: 'index',
		loading: false,
		error: '',
	};
	onConfirmPin: () => void = null;
	onConfirmPhrase: any = null;
	format: string = '';

	constructor (props: any) {
		super(props);

		this.onClose = this.onClose.bind(this);
		this.onPage = this.onPage.bind(this);
		this.onCover = this.onCover.bind(this);
		this.onLogout = this.onLogout.bind(this);
		this.onFocusPhrase = this.onFocusPhrase.bind(this);
		this.onCheckPin = this.onCheckPin.bind(this);
		this.onSelectPin = this.onSelectPin.bind(this);
		this.onTurnOffPin = this.onTurnOffPin.bind(this);
		this.onFileClick = this.onFileClick.bind(this);
	};

	render () {
		const { account } = authStore;
		const { cover, coverImage } = commonStore;
		const { page, loading, error } = this.state;
		const pin = Storage.get('pin');

		let content = null;
		let inputs = [];
		let Item = null;

		let Head = (item: any) => (
			<div className="head">
				<div className="element" onClick={() => { this.onPage(item.id); }}>
					<Icon className="back" />
					{item.name}
				</div>
			</div>
		);

		switch (page) {

			default:
			case 'index':
				content = (
					<div>
						<Title text="Settings" />

						<div className="rows">
							<div className="row" onClick={() => { this.onPage('wallpaper'); }}>
								<Icon className="wallpaper" />
								<Label text="Wallpaper" />
								<Icon className="arrow" />
							</div>

							<div className="row" onClick={() => { this.onPage('phrase'); }}>
								<Icon className="phrase" />
								<Label text="Keychain phrase" />
								<Icon className="arrow" />
							</div>

							<div className="row" onClick={() => { this.onPage('pinIndex'); }}>
								<Icon className="pin" />
								<Label text="Pin code" />
								<div className="status">
									{pin ? 'On' : 'Off'}
								</div>
								<Icon className="arrow" />
							</div>

							<div className="row" onClick={() => { this.onPage('importIndex'); }}>
								<Icon className="import" />
								<Label text="Import" />
								<Icon className="arrow" />
							</div>
						</div>

						<div className="logout" onClick={this.onLogout}>Log out</div>
					</div>
				);
				break;

			case 'wallpaper':
				let colors = [ 'yellow', 'orange', 'pink', 'red', 'purple', 'navy', 'blue', 'ice', 'teal', 'green' ];
				let covers1 = [  ];
				let covers2 = [];

				for (let i = 1; i <= 11; ++i) {
					covers1.push({ id: 'c' + i, image: '', type: I.CoverType.BgImage });
				};

				for (let c of colors) {
					covers2.push({ id: c, image: '', type: I.CoverType.Color });
				};

				if (coverImage) {
					covers2.unshift({ id: 0, image: coverImage, type: I.CoverType.Image });
				};

				Item = (item: any) => (
					<div className={'item ' + (item.active ? 'active': '')} onClick={() => { this.onCover(item); }}>
						<Cover {...item} preview={true} className={item.id} />
					</div>
				);

				content = (
					<div>
						<Head id="index" name="Settings" />
						<Title text="Wallpaper" />

						<div className="row first">
							<Label text="Choose or upload the wallpaper. For best results upload high resolution images." />
							<div className="fileWrap item" onClick={this.onFileClick}>
								<Cover className="upload" type={I.CoverType.Color} id="white" />
							</div>
						</div>

						<div className="row">
						<Label className="name" text="Pictures" />
							<div className="covers">
								{covers1.map((item: any, i: number) => (
									<Item key={i} {...item} active={item.id == cover.id} />
								))}
							</div>
						</div>

						<div className="row last">
							<Label className="name" text="Colours" />
							<div className="covers">
								{covers2.map((item: any, i: number) => (
									<Item key={i} {...item} preview={true} active={item.id == cover.id} />
								))}
							</div>
						</div>
					</div>
				);
				break;

			case 'phrase':
				content = (
					<div>
						<Head id="index" name="Settings" />
						<Title text="Keychain phrase" />
						<Label text="Your Keychain phrase protects your account. You’ll need it to sign in if you don’t have access to your devices. Keep it in a safe place." />
						<div className="inputs">
							<Textarea ref={(ref: any) => this.phraseRef = ref} value={authStore.phrase} onFocus={this.onFocusPhrase} placeHolder="witch collapse practice feed shame open despair creek road again ice least lake tree young address brain envelope" readOnly={true} />
						</div>
						{this.onConfirmPhrase ? (
							<div className="buttons">
								<Button text="I've written it down" className="orange" onClick={() => {	this.onConfirmPhrase();	}} />
							</div>
						) : ''}
					</div>
				);
				break;

			case 'pinIndex':
				content = (
					<div>
						<Head id="index" name="Settings" />
						<Title text="Pin code" />
						<Label text="The pin code will protect your keychain phrase. As we do not store your keychain phrase or pin code and do not ask your e-mail or phone number,  id recovery without your pin code or keychain phrase. So, please, remember your pin code" />

						{pin ? (
							<div className="buttons">
								<Button text="Turn pin code off" className="blank" onClick={() => {
									this.onConfirmPin = this.onTurnOffPin;
									this.onPage('pinConfirm');
								}} />
								<Button text="Change pin code" className="blank" onClick={() => {
									this.onConfirmPin = () => { this.onPage('pinSelect'); };
									this.onPage('pinConfirm');
								}} />
							</div>
						): (
							<div className="buttons">
								<Button text="Turn pin code on" className="blank" onClick={() => {
									this.onPage('pinSelect');
								}} />
							</div>
						)}

					</div>
				);
				break;

			case 'pinSelect':
				content = (
					<div>
						<Head id="pinIndex" name="Cancel" />
						<Title text="Pin code" />
						<Label text="The pin code will protect your secret phrase. As we do not store your secret phrase or pin code and do not ask your e-mail or phone number, there is no id recovery without your pin code or secret phrase. So, please, remember your pin code." />
						<Pin onSuccess={this.onSelectPin} />
					</div>
				);
				break;

			case 'pinConfirm':
				content = (
					<div>
						<Head id="pinIndex" name="Cancel" />
						<Title text="Pin code" />
						<Label text="To continue, first verify that it’s you. Enter current pin code" />
						<Error text={error} />

						<Pin 
							value={Storage.get('pin')} 
							onSuccess={this.onCheckPin} 
							onError={() => { this.setState({ error: 'Incorrect pin' }) }} 
						/>
					</div>
				);
				break;

			case 'importIndex':
				const items = [
					{ id: 'notion', name: 'Notion', disabled: false },
					{ id: 'evernote', name: 'Evernote', disabled: true },
					{ id: 'roam', name: 'Roam Researh', disabled: true },
					{ id: 'word', name: 'Word', disabled: true },
					{ id: 'text', name: 'Text & Markdown', disabled: true },
					{ id: 'html', name: 'HTML', disabled: true },
					{ id: 'csv', name: 'CSV', disabled: true },
				];

				Item = (item: any) => (
					<div className={[ 'item', item.id, (item.disabled ? 'disabled' : '') ].join(' ')} onClick={() => {
						if (!item.disabled) {
							this.onPage(Util.toCamelCase('import-' + item.id));
						};
					}}>
						{item.disabled ? <div className="soon">Soon</div> : ''}
						<div className="txt">
							<Icon />
							<div className="name">{item.name}</div>
						</div>
					</div>
				);

				content = (
					<div>
						<Head id="index" name="Settings" />
						<Title text="Import" />
						<Label text="Choose application or format, which data you want to import" />
						<div className="items">
							{items.map((item: any, i: number) => (
								<Item key={i} {...item} />
							))}
						</div>
					</div>
				);
				break;

			case 'importNotion':
				content = (
					<div>
						<Head id="importIndex" name="Import" />

						<Title text="How to import from Notion" />
						<Label text="First you need to export data." />

						<div className="path">
							<b>Get all data:</b><br/>
							<Smile icon=":gear:" /> Settings & Members → <Smile icon=":house:" /> Settings → Export all workspace content → <br/>
							Export format : "Markdown & CSV".
						</div>

						<div className="path">
							<b>Get certain pages:</b><br/>
							Three dots menu on the top-left corner → <Smile icon=":paperclip:" /> Export →  <br/> Export format : "Markdown & CSV".
						</div>

						<Label className="last" text="After that you need to select Zip archive and Anytype will do the rest." />

						<Button text="Import data" className="orange" onClick={() => { this.onImport('notion'); }} />
					</div>
				);
				break;
		};

		return (
			<div className={'tab ' + Util.toCamelCase('tab-' + page)}>
				{loading ? <Loader /> : ''}
				{content}
			</div>
		);
	};

	componentDidMount () {
		const { param } = this.props;
		const { data } = param;
		const { page } = data || {};

		if (page) {
			this.onPage(page);
		};

		this.init();
	};

	componentDidUpdate () {
		this.init();
	};

	componentWillUnmount () {
		$(window).unbind('resize.settings');
	};

	onFileClick (e: any) {
		const { root } = blockStore;
		const options: any = {
			properties: [ 'openFile' ],
			filters: [ { name: '', extensions: Constant.extension.image } ]
		};

		dialog.showOpenDialog(options).then((result: any) => {
			const files = result.filePaths;
			if ((files == undefined) || !files.length) {
				return;
			};

			this.setState({ loading: true });

			C.UploadFile('', files[0], I.FileType.Image, true, (message: any) => {
				if (message.error.code) {
					return;
				};

				this.setState({ loading: false });
				commonStore.coverSetUploadedImage(message.hash);
				commonStore.coverSet('', message.hash, I.CoverType.Image);
				DataUtil.pageSetCover(root, I.CoverType.Image, message.hash);
			});
		});
	};

	onFocusPhrase (e: any) {
		this.phraseRef.select();
	};

	onCheckPin (pin: string) {
		this.onPage('pinSelect');
		if (this.onConfirmPin) {
			this.onConfirmPin();
			this.onConfirmPin = null;
		};
		this.setState({ error: '' });
	};

	onSelectPin (pin: string) {
		Storage.set('pin', sha1(pin));
		this.onPage('index');
	};

	onTurnOffPin () {
		Storage.delete('pin');
		this.onPage('index');
	};

	onClose () {
		this.props.close();
	};

	onPage (id: string) {
		if (id != 'phrase') {
			this.onConfirmPhrase = null;
		};

		this.setState({ page: id });
	};

	onCover (item: any) {
		const { root } = blockStore;

		DataUtil.pageSetCover(root, item.type, item.image || item.id);
		commonStore.coverSet(item.id, item.image, item.type);
	};

	onLogout (e: any) {
		const { history } = this.props;

		this.onConfirmPhrase = () => {
			C.AccountStop(false);
			authStore.logout();
			history.push('/');

			this.onConfirmPhrase = null;
		};
		
		this.onPage('phrase');
	};

	onImport (format: string) {
		const platform = Util.getPlatform();
		const { history } = this.props;
		const { root } = blockStore;
		const options: any = { 
			properties: [ 'openFile' ],
			filters: [
				{ name: '', extensions: [ 'zip' ] }
			]
		};

		if (platform == I.Platform.Mac) {
			options.properties.push('openDirectory');
		};

		dialog.showOpenDialog(options).then((result: any) => {
			const files = result.filePaths;
			if ((files == undefined) || !files.length) {
				return;
			};

			this.setState({ loading: true });
			C.BlockImportMarkdown(root, files[0], () => {
				this.props.close();
				this.setState({ loading: false });
				
				history.push('/main/index');
			});
		});
	};

	init () {
		this.props.position();
		$(window).unbind('resize.settings').on('resize.settings', () => { this.props.position(); });
	};

};

export default PopupSettings;
