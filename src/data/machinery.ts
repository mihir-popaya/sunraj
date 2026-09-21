export type TechnicalSpec = {
  label: string;
  value: string;
};

export type MachineryItem = {
  id: string;
  number: string;
  category: string;
  name: string;
  description: string;

  image?: string;

  imageType: "cover" | "contain";

  specs: {
    function: string;
    qualityAdvantage: string;
    productionCapability: string;
    automation: string;
  };

  technicalSpecifications: TechnicalSpec[];

  cta: string;
};

export const machineryData: MachineryItem[] = [
  {
    id: "m1",
    number: "01",
    category: "Corrugation",

    name: "Automatic Corrugation Plant — Ming Wei, Taiwan",

    description:
      "Kraft paper is conditioned, fluted, glued and bonded in one continuous pass, then slit, scored, cut to length and stacked automatically. Deckle width is 2.2 metres. Paper is tested before it goes on the line and board is checked again as it comes off the stacker.",

    image: "/images/machinery/ming-wei.jpg",

    imageType: "cover",

    specs: {
      function: "Automatic board formation",
      qualityAdvantage: "Uniform flute & bond strength",
      productionCapability: "2.2 m deckle, 3/5/7-ply",
      automation: "Fully automatic, end-to-end",
    },

    technicalSpecifications: [
      {
        label: "Make",
        value: "Ming Wei, Taiwan",
      },
      {
        label: "Deckle width",
        value: "2,200 mm",
      },
      {
        label: "Flute types",
        value: "A, B, C, E and combined",
      },
      {
        label: "Board grades",
        value: "3-ply, 5-ply, 7-ply",
      },
      {
        label: "Line configuration",
        value:
          "Automatic reel stands, pre-heaters, single facer, double-backer, slitter-scorer, auto stacker",
      },
      {
        label: "Recorded per run",
        value:
          "Glue viscosity, flute temperature, line speed, pressure",
      },
      {
        label: "Traceability",
        value:
          "Job number, paper lot, date, machine, operator",
      },

      // Reserved for future confirmed data
      {
        label: "Monthly tonnage",
        value: "To be confirmed",
      },
      {
        label: "Rated line speed",
        value: "To be confirmed",
      },
    ],

    cta: "Enquire about capacity",
  },

  {
    id: "m2",
    number: "02",
    category: "Converting",

    name: "Five-Colour Printer Slotter Die Cutter — SHINKO, Japan",

    description:
      "Our main converting line. It prints up to five colours, then punches, creases, slots, die cuts and glues without the sheet leaving the machine. Lead-edge feeding keeps registration steady through long runs. Wax and water-proof printing is available for boxes that will meet humidity or cold storage.",

    image: "/images/machinery/shinko.jpg",

    imageType: "contain",

    specs: {
      function: "Print, slot, cut & glue inline",
      qualityAdvantage: "Registration accuracy",
      productionCapability: "1 to 5 colours, high definition",
      automation: "Lead-edge / vacuum fed",
    },

    technicalSpecifications: [
      {
        label: "Make",
        value: "SHINKO, Japan",
      },
      {
        label: "Print units",
        value: "1 to 5 colours, flexographic",
      },
      {
        label: "Special printing",
        value: "Wax and water-proof facility",
      },
      {
        label: "Inline operations",
        value:
          "Punching, creasing, slotting, rotary die cutting, auto gluing",
      },
      {
        label: "Feeding",
        value: "Lead-edge with vacuum transfer",
      },
      {
        label: "Inspection",
        value:
          "Inline rejection of non-conforming sheets",
      },
    ],

    cta: "Enquire about printing",
  },

  {
    id: "m3",
    number: "03",
    category: "Converting",

    name: "Two-Colour Printer Slotter Rotary Die Cutter — LIFEI, China",

    description:
      "A second converting line for one and two-colour work. Having it means short and repeat jobs are not held up behind long five-colour runs. Two sheet-size configurations are available, the larger taking sheets up to 1800 x 3400 mm.",

    image: "/images/machinery/lifei.jpg",

    imageType: "contain",

    specs: {
      function: "Print, slot & rotary die cut",
      qualityAdvantage: "Registration control",
      productionCapability: "Sheets up to 1800 × 3400 mm",
      automation: "Lead-edge / vacuum fed",
    },

    technicalSpecifications: [
      {
        label: "Make",
        value: "LIFEI, China",
      },
      {
        label: "Print units",
        value: "2 colours, high-definition flexo",
      },
      {
        label: "Machine 1 — max sheet",
        value: "1,800 × 3,400 mm",
      },
      {
        label: "Machine 2 — max sheet",
        value: "1,450 × 2,400 mm",
      },
      {
        label: "Inline operations",
        value: "Punching, creasing, slotting",
      },
      {
        label: "Application",
        value:
          "Logos, text, handling symbols, product information",
      },
    ],

    cta: "Enquire about short runs",
  },

  {
    id: "m4",
    number: "04",
    category: "Finishing",

    name: "Automatic Die Cutter with Stripping — Dayuan, China",

    description:
      "Steel-rule dies cut trays, partitions, inner fitments and shaped packs to your drawing, so we are not limited to plain slotted cartons. Feeding is automatic with registration control. Die changeover is quick, which keeps short runs and repeats affordable. Board from 3-ply to 7-ply, subject to machine specification.",

    image: "/images/machinery/dayuan.jpg",

    imageType: "cover",

    specs: {
      function: "Die cut, crease & perforate",
      qualityAdvantage: "Dimensional precision",
      productionCapability: "3-ply to 7-ply board",
      automation: "Auto feed, strip & stack",
    },

    technicalSpecifications: [
      {
        label: "Make",
        value: "Dayuan, China",
      },
      {
        label: "Tooling",
        value: "Steel-rule dies to customer drawing",
      },
      {
        label: "Feeding",
        value:
          "Automatic lead-edge with registration control",
      },
      {
        label: "Delivery",
        value:
          "Waste stripping, counting, automatic stacking",
      },
      {
        label: "Board range",
        value:
          "3-ply, 5-ply, 7-ply (subject to specification)",
      },
      {
        label: "Output styles",
        value:
          "Trays, partitions, inner fitments, shaped and display packs",
      },
    ],

    cta: "Enquire about die-cut designs",
  },

  {
    id: "m5",
    number: "05",
    category: "Assembly",

    name: "Automatic Folder Gluer Stitcher — Insun, South Korea",

    description:
      "Feeds, folds, glues, stitches and counts in a single pass. Glued joints for retail work, stitched joints where the load calls for it. The counter ejector delivers bundles already counted and squared, so the quantity is settled at the machine and not counted again afterwards. Automatic size changeover between jobs.",

    image: "/images/machinery/insun.jpg",

    imageType: "contain",

    specs: {
      function: "Fold, glue, stitch & count",
      qualityAdvantage: "Joint & seam strength",
      productionCapability: "RSC & customised, 3–7 ply",
      automation: "Single-pass, auto size change",
    },

    technicalSpecifications: [
      {
        label: "Make",
        value: "Insun, South Korea",
      },
      {
        label: "Operations",
        value:
          "Feeding, folding, glue application, pressing, stitching, counting",
      },
      {
        label: "Counter ejector",
        value: "Counted, aligned bundle delivery",
      },
      {
        label: "Changeover",
        value:
          "Automatic size changeover between box dimensions",
      },
      {
        label: "Joint options",
        value: "Glued or stitched, as specified",
      },
      {
        label: "Box styles",
        value:
          "RSC, regular slotted and customised",
      },
      {
        label: "Inline checks",
        value:
          "Glue coverage, stitch quality, joint position, flap alignment, dimensions",
      },
    ],

    cta: "Enquire about box styles",
  },

  {
    id: "m6",
    number: "06",
    category: "Material handling",

    name: "Five-Ply Corrugated Box Conveyor Line",

    description:
      "Board travels from the corrugator to the converting machines on a powered line. Work in progress accumulates in buffers, so the corrugator keeps running while a converting machine is changing over. It also takes most of the lifting out of the job, which counts for a lot with 5-ply board.",

    image: "/images/machinery/conveyor.jpg",

    imageType: "cover",

    specs: {
      function: "Inter-machine board transfer",
      qualityAdvantage: "Protected flute & edges",
      productionCapability: "Buffered continuous flow",
      automation: "Speed-synchronised transfer",
    },

    technicalSpecifications: [
      {
        label: "Function",
        value:
          "Automatic sheet transfer, corrugator to conversion",
      },
      {
        label: "Buffering",
        value:
          "Work-in-progress accumulation across changeovers",
      },
      {
        label: "Synchronisation",
        value:
          "Conveyor speed matched to line output",
      },
      {
        label: "Handling benefit",
        value:
          "Manual lift-and-carry substantially eliminated",
      },
      {
        label: "Floor discipline",
        value:
          "Defined material path, aisles kept clear",
      },
    ],

    cta: "Enquire about throughput",
  },

  {
    id: "m7",
    number: "07",
    category: "Quality assurance",

    name: "In-House Testing Laboratory",

    description:
      "Eight instruments covering bursting strength, box compression, ECT, RCT, CMT, FCT, Cobb value and moisture. Every paper consignment and every production batch is tested here before it moves on. Because the lab is on site, a doubtful consignment can be held and retested the same day. Records are kept against each batch.",

    image: "/images/machinery/testing-laboratory.jpg",

    imageType: "cover",

    specs: {
      function: "Batch validation",
      qualityAdvantage: "Certified strength data",
      productionCapability: "100% batch coverage",
      automation: "Instrument-verified results",
    },

    technicalSpecifications: [
      {
        label: "Bursting strength tester",
        value:
          "Fully automatic, touch screen. Ply burst and BF, pneumatic clamping",
      },
      {
        label: "Bursting strength tester",
        value:
          "Semi-automatic, digital. Incoming paper BF and cross-verification",
      },
      {
        label: "Box compression tester",
        value:
          "Motorised, digital. Stacking strength, deflection and peak load",
      },
      {
        label: "Crush tester",
        value:
          "Touch screen, multi-mode. ECT, RCT, CMT and FCT",
      },
      {
        label: "Sample test cutters",
        value:
          "Pneumatic bench and vertical models. ECT/RCT and GSM/Cobb specimens",
      },
      {
        label: "Cobb tester",
        value:
          "Water absorptiveness of kraft liner, standard hand roller",
      },
      {
        label: "Paper moisture meter",
        value:
          "Digital with calibrator. Reel and sheet moisture",
      },
      {
        label: "Inspection gates",
        value:
          "Incoming material · In-process · Finished box",
      },
      {
        label: "Documentation",
        value:
          "QAP, inspection reports, calibration records, CAPA, traceability, COA",
      },
    ],

    cta: "Ask about test reports",
  },

  {
    id: "m8",
    number: "08",
    category: "Logistics",

    name: "In-House Dispatch Fleet — 40 Vehicles",

    description:
      "Forty vehicles, all owned by us, with closed container bodies that keep board dry on the road. We set the dispatch date ourselves instead of booking a transporter and hoping. Quantity is checked against your purchase order before the vehicle is loaded.",

    image: "/images/machinery/dispatch-fleet.jpg",

    imageType: "contain",

    specs: {
      function: "Plant-to-gate delivery",
      qualityAdvantage: "Weather-protected transit",
      productionCapability: "40 vehicles, 100% owned",
      automation: "PO-verified before loading",
    },

    technicalSpecifications: [
      {
        label: "Fleet size",
        value: "40 vehicles",
      },
      {
        label: "Ownership",
        value: "Entirely company-owned",
      },
      {
        label: "Body type",
        value: "Closed container",
      },
      {
        label: "Scheduling",
        value:
          "Capacity planned against the dispatch programme",
      },
      {
        label: "Pre-dispatch check",
        value:
          "Quantity reconciled to purchase order at the dock",
      },
      {
        label: "Accountability",
        value:
          "Single party from corrugator to delivery point",
      },
    ],

    cta: "Enquire about delivery",
  },
];