package com.example.travelreimbursement.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ClaimTest {
    
    @Test
    void testClaimCreation() {
        Claim claim = new Claim();
        claim.setDescription("Test claim");
        claim.setStatus(ClaimStatus.DRAFT);
        
        assertNotNull(claim);
        assertEquals("Test claim", claim.getDescription());
        assertEquals(ClaimStatus.DRAFT, claim.getStatus());
    }
}
