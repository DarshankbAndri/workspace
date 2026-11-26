package com.example.cmmsApplication.common.time;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;

import java.io.IOException;
import java.time.Instant;

public class UtcInstantDeserializer extends JsonDeserializer<Instant> {
    @Override
    public Instant deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        String value = parser.getValueAsString();
        try {
            return UtcInstantParser.parse(value);
        } catch (IllegalArgumentException exception) {
            throw InvalidFormatException.from(parser,
                    "Timestamp must be an ISO-8601 UTC value ending in Z", value, Instant.class);
        }
    }
}
