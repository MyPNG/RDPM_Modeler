export default function CustomPaletteProvider(
  palette,
  create,
  elementFactory,
  translate,
  originalPaletteProvider
) {
  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;
  this._translate = translate;
  this._originalPaletteProvider = originalPaletteProvider;

  palette.registerProvider(this);
}

CustomPaletteProvider.$inject = [
  "palette",
  "create",
  "elementFactory",
  "translate",
  "originalPaletteProvider",
];

CustomPaletteProvider.prototype.getPaletteEntries = function (element) {
  const entries = this._originalPaletteProvider.getPaletteEntries(element);

  entries["create.parallel-gateway"] = {
    group: "gateway",
    className: "bpmn-icon-gateway-parallel",
    title: this._translate("Create Parallel Gateway"),
    action: {
      dragstart: (event) => {
        const shape = this._elementFactory.createShape({
          type: "bpmn:ParallelGateway",
        });
        this._create.start(event, shape);
      },
      click: (event) => {
        const shape = this._elementFactory.createShape({
          type: "bpmn:ParallelGateway",
        });
        this._create.start(event, shape);
      },
    },
  };

  return entries;
};
