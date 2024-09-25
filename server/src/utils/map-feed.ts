import dotenv from "dotenv";
dotenv.config();

const { CURRENCY_RATE } = process.env;

export const mapFeed = (feedData: any) => {
  let feed = feedData.map((x: any) => ({
    mainnumber: x[0],
    supplier: x[1],
    name: x[3],
    ean: x[4],
    weight: x[6],
    width: x[7],
    height: x[8],
    length: x[9],
    hts_code: x[13],
    coo: x[14],
    desc_custom: x[15],
    desc_customer: x[17],
  }));

  feed = feed.slice(1);
  return feed;
};

export const mapPriceList = (pricelistData: any) => {
  let priceList = pricelistData.map((x: any) => ({
    mainnumber: x[0],
    cost: x[14],
    price: x[23],
    price_eur: x[12],
    price_aud: x[22],
  }));

  priceList = priceList.slice(3);
  return priceList;
};

export const createProductObj = (feedMap: any, priceListMap: any) => {
  let productObj = feedMap.map((x: any) => ({
    product: {
      title: x.supplier + " " + x.name,
      vendor: x.supplier,
      tags: x.desc_customer + ", Pending approval" + ", Auto uploaded",
      status: "DRAFT",
      metafields: [
        // {
        //   namespace: "specs",
        //   key: "ean",
        //   type: "single_line_text_field",
        //   value: x.ean?.toString() || "",
        // },
        {
          namespace: "specs",
          key: "description_custom",
          type: "single_line_text_field",
          value: x.desc_custom?.toString() || "",
        },
        {
          namespace: "specs",
          key: "package_width",
          type: "number_integer",
          value: parseInt(x.width)?.toString() || "0",
        },
        {
          namespace: "specs",
          key: "package_height",
          type: "number_integer",
          value: parseInt(x.height)?.toString() || "0",
        },
        {
          namespace: "specs",
          key: "package_depth",
          type: "number_integer",
          value: parseInt(x.length)?.toString() || "0",
        },
        {
          namespace: "cost",
          key: "eur",
          type: "number_decimal",
          value:
            priceListMap
              .find((y: any) => y.mainnumber === x.mainnumber)
              ?.price_eur?.toString() || "0",
        },
        {
          namespace: "price",
          key: "aud",
          type: "number_decimal",
          value:
            priceListMap
              .find((y: any) => y.mainnumber === x.mainnumber)
              ?.price_aud?.toString() || "0",
        },
      ],
    },
    variant: {
      barcode: x.ean?.toString(),
      price:
        priceListMap.find((y: any) => y.mainnumber === x.mainnumber)?.price ||
        "0",
      compareAtPrice:
        priceListMap.find((y: any) => y.mainnumber === x.mainnumber)?.price ||
        "0",
      inventoryItem: {
        measurement: {
          weight: {
            unit: "KILOGRAMS",
            value: parseFloat(x.weight) || 0,
          },
        },
        harmonizedSystemCode: x.hts_code?.toString() || "",
        tracked: true,
        countryCodeOfOrigin: x.coo,
        sku: x.name,
        cost: priceListMap.find((y: any) => y.mainnumber === x.mainnumber)?.cost
          ? parseInt(
              priceListMap.find((y: any) => y.mainnumber === x.mainnumber)?.cost
            ).toString()
          : "0",
      },
      inventoryPolicy: "DENY",
      metafields: [
        {
          namespace: "specs",
          key: "vendor_sku",
          type: "single_line_text_field",
          value: x.mainnumber?.toString() || "",
        },
        {
          namespace: "price",
          key: "aud_variant",
          type: "number_decimal",
          value:
            priceListMap
              .find((y: any) => y.mainnumber === x.mainnumber)
              ?.price_aud?.toString() || "0",
        },
        {
          namespace: "cost",
          key: "eur_variant",
          type: "number_decimal",
          value:
            priceListMap
              .find((y: any) => y.mainnumber === x.mainnumber)
              ?.price_eur?.toString() || "0",
        },
      ],
    },
  }));

  return productObj;
};
