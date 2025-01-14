import server from "../../services/server.js";
import mimeTypesService from "../../services/mime_types.js";
import optionsService from "../../services/options.js";

const TPL = `
<h4>Available MIME types in the dropdown</h4>

<ul id="options-mime-types" style="max-height: 500px; overflow: auto; list-style-type: none;"></ul>`;

export default class CodeNotesOptions {
    constructor() {
        $("#options-code-notes").html(TPL);

        this.$mimeTypes = $("#options-mime-types");
    }

    async optionsLoaded(options) {
        this.$mimeTypes.empty();

        let idCtr = 1;

        for (const mimeType of await mimeTypesService.getMimeTypes()) {
            const id = "code-mime-type-" + (idCtr++);

            this.$mimeTypes.append($("<li>")
                .append($('<input type="checkbox">')
                    .attr("id", id)
                    .attr("data-mime-type", mimeType.mime)
                    .prop("checked", mimeType.enabled))
                    .change(() => this.save())
                .append(" &nbsp; ")
                .append($('<label>')
                    .attr("for", id)
                    .text(mimeType.title))
            );
        }
    }

    async save() {
        const enabledMimeTypes = [];

        this.$mimeTypes.find("input:checked").each(
            (i, el) => enabledMimeTypes.push($(el).attr("data-mime-type")));

        const opts = { codeNotesMimeTypes: JSON.stringify(enabledMimeTypes) };

        await server.put('options', opts);

        await optionsService.reloadOptions();
    }
}