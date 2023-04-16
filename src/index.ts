import joplin from 'api';
import { SettingItemType, ImportContext, FileSystemItem } from 'api/types';
import { execSync } from 'child_process';

const pdf_to_image = async (ctx: ImportContext): Promise<void> => {
	return new Promise(
		async function (resolve, reject) {
			try {
				console.info('Setting in file is: ' + ctx.sourcePath);
				const apiToken = await joplin.settings.value('clipperAPIToken');
				const note = await joplin.workspace.selectedNote();

				if (note) {
					console.info(note);
					const execStr = 'noteUpload.py --use-id --note-id=' + note.id + " --pdf=\"" + ctx.sourcePath + "\" --api-token=" + apiToken;
					console.info("Exec:");
					console.info(execStr);

					const result = execSync(execStr); // Throws if error
					console.info(result.toString());
				}

				console.info('Import successfully completed');
				resolve();
			}
			catch (ex) {
				console.error('Exception: ' + ex);
				reject();
			}
		});
}

joplin.plugins.register({
	onStart: async function () {
		console.info("Loaded plugin");

		await joplin.settings.registerSection('pdfPrintoutSection', {
			label: 'Joplin PDF Printout',
			iconName: 'fas fa-file-pdf',
		});

		await joplin.settings.registerSettings({
			'clipperAPIToken': {
				value: '',
				type: SettingItemType.String,
				section: 'pdfPrintoutSection',
				public: true,
				label: 'Clipper Web API Token',
			},
		});

		await joplin.interop.registerImportModule(
			{
				format: 'pdf',
				isNoteArchive: false,
				description: 'PDF File',
				fileExtensions: ['pdf',],
				sources: [FileSystemItem.File],
				onExec: pdf_to_image,
			});
	},
});
