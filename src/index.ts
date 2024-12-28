import { Elysia } from "elysia";
import provinceModel from "./models/provinces";
import cityModel from "./models/citys";
import districtModel from "./models/district";
import subdistrictModel from "./models/subdistrict";
import icdoModel from "./models/icdo";
import xlsx from "xlsx";
import mongoose from "mongoose";

export interface RootJSON {
  status: number
  error: boolean
  message: string
  data: Province[]
}

export interface Province {
  code: string
  parent_code: string
  bps_code: string
  name: string
}

// Database connection handler
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(Bun.env.MONGO_URL || "mongodb://localhost:27017/your_database_name"); // Update your MongoDB connection string
    console.log("Database connected.");
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchDistricts = async (cityCode: string): Promise<RootJSON["data"]> => {
  const headers = new Headers();
  headers.append("Authorization", "Bearer ");

  const response = await fetch(
    `https://api-satusehat.kemkes.go.id/masterdata/v1/districts?city_codes=${cityCode}`,
    {
      method: "GET",
      headers: headers,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch districts for city code ${cityCode}: ${response.status}`);
  }

  const json: RootJSON = await response.json();
  return json.data || [];
};


// Function to fetch sub-districts via fetch
const fetchSubdistricts = async (districtCode: string): Promise<any[]> => {
  const headers = new Headers();
  headers.append("Authorization", "Bearer ");

  const response = await fetch(
    `https://api-satusehat.kemkes.go.id/masterdata/v1/sub-districts?district_codes=${districtCode}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sub-districts for district code ${districtCode}: ${response.status}`
    );
  }

  const json = await response.json();
  return json.data || [];
};

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .get("/auth", async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("client_id", "");
    urlencoded.append("client_secret", "");

    const res = await fetch("https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials", {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    })
    
    return res
  })
  .get("/province", async () => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer ");

    const response = await fetch(
      "https://api-satusehat.kemkes.go.id/masterdata/v1/provinces", {
        method: "GET",
        headers: myHeaders,
      })

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

    const json : RootJSON = await response.json();
    json.data.forEach(async (item) => {
      const province: Province = {
        code: item.code,
        parent_code: item.parent_code,
        bps_code: item.bps_code,
        name: item.name,
      };

      await provinceModel.create(province);
    });

    return {
      message: "Provinces inserted successfully",
      insertedCount: json.data.length,
    };
  })
  .get("/city", async () => {
    const provinces = await provinceModel.find({}, "code").exec();

    provinces.forEach(async (province) => {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", "Bearer ");

      const response = await fetch(
        `https://api-satusehat.kemkes.go.id/masterdata/v1/cities?province_codes=${province.code}`, {
          method: "GET",
          headers: myHeaders,
        })

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json : RootJSON = await response.json();
      await cityModel.insertMany(json.data)
      console.log(json.data)
      await Bun.sleep(100)
    })

    return {
      message: "Okeee",
    }
  })
  .get("/district", async () => {
    const encoder = new TextEncoder(); // For encoding streamed data

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await connectDB();
          controller.enqueue(encoder.encode("Database connected...\n"));

          const cityData = await cityModel.find({}, "code").exec();
          controller.enqueue(encoder.encode(`Found ${cityData.length} cities.\n`));

          for (const city of cityData) {
            try {
              controller.enqueue(encoder.encode(`Fetching districts for city code: ${city.code}...\n`));
              const districts = await fetchDistricts(city.code);

              if (districts.length > 0) {
                await districtModel.insertMany(districts);
                controller.enqueue(
                  encoder.encode(`Inserted ${districts.length} districts for city code: ${city.code}.\n`)
                );
              } else {
                controller.enqueue(encoder.encode(`No districts found for city code: ${city.code}.\n`));
              }

              await sleep(500); // Sleep to handle rate limiting
            } catch (error) {
              controller.enqueue(encoder.encode(`Error for city code ${city.code}: ${error}\n`));
            }
          }

          await disconnectDB();
          controller.enqueue(encoder.encode("Database disconnected.\n"));
          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`Error: ${error}\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  })
  .get("/sub-district", async ({ response }) => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await connectDB();
          controller.enqueue(encoder.encode("Database connected...\n"));

          const districtData = await districtModel.find({}, "code").exec();
          controller.enqueue(
            encoder.encode(`Found ${districtData.length} districts.\n`)
          );

          for (const district of districtData) {
            try {
              controller.enqueue(
                encoder.encode(
                  `Fetching subdistricts for district code: ${district.code}...\n`
                )
              );

              const subdistricts = await fetchSubdistricts(district.code);

              if (subdistricts.length > 0) {
                await subdistrictModel.insertMany(subdistricts);
                controller.enqueue(
                  encoder.encode(
                    `Inserted ${subdistricts.length} subdistricts for district code: ${district.code}.\n`
                  )
                );
              } else {
                controller.enqueue(
                  encoder.encode(
                    `No subdistricts found for district code: ${district.code}.\n`
                  )
                );
              }

              await sleep(500); // Sleep to handle rate limiting
            } catch (error) {
              controller.enqueue(
                encoder.encode(
                  `Error for district code ${district.code}: ${error}\n`
                )
              );
            }
          }

          await disconnectDB();
          controller.enqueue(encoder.encode("Database disconnected.\n"));
          controller.close();
          
        } catch (error) {
          controller.enqueue(encoder.encode(`Error: ${error}\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  })
  .post("/icd-10", async (ctx) => {
    // Parse the form data to extract the file
    const formData = await ctx.request.formData();
    const file = formData.get("file") as File;

    // Validate the file
    if (!file) {
      return { error: "No file uploaded!" };
    }

    if (!file.name.endsWith(".xlsx")) {
      return { error: "Only .xlsx files are supported!" };
    }

    // Read the file contents
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "buffer" });

    // Extract the first sheet's data
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Transform and insert into MongoDB
    const rowsToInsert = sheetData.map((row: any) => ({
      code: row.CODE,
      display: row.STR,
      version: row.SAB,
      status: true
    }));

    // Insert into MongoDB
    // await icd10Model.insertMany(rowsToInsert);
    await icdoModel.insertMany(rowsToInsert);

    return {
      message: "Excel file uploaded and data inserted successfully",
      insertedCount: rowsToInsert.length,
    };
  })
  .post("/upload-zip", async (ctx) => {
    try {
      const formData = await ctx.request.formData();
      const file = formData.get("file") as File;
  
      // Validate file presence and type
      if (!file) {
        return { error: "No file uploaded!" };
      }
      if (!file.name.endsWith(".xlsx")) {
        return { error: "Only .xlsx files are supported!" };
      }
  
      // Read file contents
      const buffer = await file.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: "buffer" });
  
      // Extract data from the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
      // Validate sheet data structure
      if (!Array.isArray(sheetData) || sheetData.length === 0) {
        return { error: "The Excel sheet is empty or invalid!" };
      }
      await connectDB();

      // Process each row
      for (const row of sheetData) {
        const { id, nm, zip } = row as { id: string; nm: string; zip: string };
  
        if (!id || !zip) {
          console.warn("Skipping invalid row:", row);
          continue;
        }
  
        // Remove dots from ID
        const processedId = id.replace(/\./g, "");
        console.log(`Processing ID: ${processedId}`);
  
        // Update subdistrictModel
        const result = await subdistrictModel.findOneAndUpdate(
          { code: processedId },
          { pos_code: zip },
          { new: true } // Return the updated document
        );

        console.log(result)
  
        if (!result) {
          console.warn(`No record found for code: ${processedId}`);
        }
      }
  
      return { success: true, message: "File processed successfully!" };
    } catch (error) {
      console.error("Error processing file:", error);
      return { error: "An error occurred while processing the file!" };
    } finally {
      await disconnectDB();
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
