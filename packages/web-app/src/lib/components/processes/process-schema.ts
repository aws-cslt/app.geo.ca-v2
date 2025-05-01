type ProcessDescription = {
    id: string,
    title?: string,
    description?: string,
    // keywords?: Array<string>,
    // metadata?: Array<Metadata>,
    // version: string,
    inputs?: Record<string, InputDescription>,
    outputs?: Record<string, OutputDescription>,
    // jobControlOptions?: Array<string>,
    // outputTransmission?: Array<string>,
    links?: Array<Link>
}

type InputDescription = {
    title?: string,
    description?: string,
    keywords?: Array<string>,
    // metadata?: Array<Metadata>,
    schema: Schema,
    minOccurs?: number,
    maxOccurs?: number | "unbounded"
}

type OutputDescription = {
    title?: string,
    description?: string,
    keywords?: Array<string>,
    metadata?: Array<Metadata>,
    schema: Schema
}

type Schema = {
    title?: string,
    description?: string,
    format?: string,
    default?: any,
    nullable?: boolean,
    readOnly?: boolean,
    writeOnly?: boolean,
    example?: any,
    deprecated?: boolean,
    contentMediaType?: string,
    contentEncoding?: string,
    contentSchema?: string,
    multipleOf?: number,
    minimum?: number,
    exclusiveMinimum?: boolean,
    maximum?: number,
    exclusiveMaximum?: boolean,
    maxLength?: number,
    minLength?: number,
    pattern?: string,
    maxItems?: number,
    minItems?: number,
    uniqueItems?: boolean,
    maxProperties?: number,
    minProperties?: number,
    requred?: Array<string>,
    enum?: Array<any>,
    type?: DataType
}

enum DataType {
    Array = "array",
    Boolean = "boolean",
    Integer = "integer",
    Number = "number",
    Object = "object",
    String = "string"
}

type JobStatus = {
    processID?: string,
    type: string
    jobID: string,
    status: string,
    message?: string,
    created?: string,
    started?: string,
    finished?: string,
    updated?: string,
    progress?: number,
    links?: Array<Link>
}

type Link = {
    href: string,
    rel?: string,
    type?: string,
    hreflang?: string,
    title?: string
}

type ExecutionRequest = {
    inputs?: any,
    outputs?: any,
    response?: "raw" | "document",
    subscriber?: any
}

type Output = {
    format?: Format,
    transmissionMode?: TransmissionMode
}

