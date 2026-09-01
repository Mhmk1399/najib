import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CatalogService } from "./catalog.service.js";

@ApiTags("catalog")
@Controller("catalog")
export class CatalogController {
  constructor(@Inject(CatalogService) private readonly catalog: CatalogService) {}

  @Get(":resource")
  @ApiOperation({ summary: "List a catalog resource with pagination and filters" })
  @ApiParam({ name: "resource", enum: ["categories", "subcategories", "collections", "colors", "size-groups", "sizes", "products", "variants", "images"] })
  list(@Param("resource") resourceValue: string, @Query() queryValue: unknown) {
    const resource = this.catalog.parseResource(resourceValue);
    return this.catalog.list(resource, this.catalog.parseListQuery(queryValue));
  }

  @Get(":resource/:id")
  @ApiOperation({ summary: "Read one catalog record" })
  findById(@Param("resource") resourceValue: string, @Param("id") idValue: string) {
    const resource = this.catalog.parseResource(resourceValue);
    return this.catalog.findById(resource, this.catalog.parseId(idValue));
  }

  @Post(":resource")
  @ApiOperation({ summary: "Create a validated catalog record" })
  create(@Param("resource") resourceValue: string, @Body() body: unknown) {
    const resource = this.catalog.parseResource(resourceValue);
    return this.catalog.create(resource, this.catalog.parseCreate(resource, body));
  }

  @Patch(":resource/:id")
  @ApiOperation({ summary: "Update selected fields on a catalog record" })
  update(
    @Param("resource") resourceValue: string,
    @Param("id") idValue: string,
    @Body() body: unknown,
  ) {
    const resource = this.catalog.parseResource(resourceValue);
    const id = this.catalog.parseId(idValue);
    return this.catalog.update(resource, id, this.catalog.parseUpdate(resource, body));
  }
}
