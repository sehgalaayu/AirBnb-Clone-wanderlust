const { z } = require("zod");

const listingSchemaZod = z.object({
  listing: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.preprocess((val) => Number(val), z.number().min(0, "Price must be positive")),
    location: z.string().min(1, "Location is required"),
    country: z.string().min(1, "Country is required"),
    image: z.object({
      url: z.string().optional().nullable(),
      filename: z.string().optional().nullable(),
    }).optional(),
  })
});

const reviewSchemaZod = z.object({
  review: z.object({
    rating: z.preprocess((val) => Number(val), z.number().min(1).max(5)),
    comment: z.string().min(1, "Comment is required"),
  })
});

module.exports = {
  listingSchemaZod,
  reviewSchemaZod,
};