"use client";

import React, { useEffect, useState } from "react";
import { UnitCard } from "../card/CardUnit";
import { createClient, createClient2 } from "@/lib/supabase/client";
import { getFranchiseStyles } from "@/lib/utils";
import { UnitStatus } from "@/types/units";
import { ArchiveUnitModal } from "@/components/modal/ArchieveUniit";
import { toast } from "sonner";

import { getBaccaratData, updateBaccaratRow } from "@/helper/baccarat";
import { getUnitsWithCounts, archiveUnit } from "@/helper/units";
import { getFranchises } from "@/helper/franchise";
import { Franchise } from "@/types/franchise";
import { UnitModal } from "../modal/Update/UnitModal";

interface UnitsRealtimeProps {
    initialData: any[];
    searchQuery?: string;
}

export const UnitsRealtime = React.forwardRef(({ initialData, searchQuery: externalSearchQuery }: UnitsRealtimeProps, ref) => {
    const [units, setUnits] = useState(initialData);
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [searchQuery, setSearchQuery] = useState(externalSearchQuery || "");

    // Update internal search query if external prop changes
    useEffect(() => {
        if (externalSearchQuery !== undefined) {
            setSearchQuery(externalSearchQuery);
        }
    }, [externalSearchQuery]);
    const supabase = createClient();

    const [selectedUnitForArchive, setSelectedUnitForArchive] = useState<{ id: string, name: string } | null>(null);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [unitToEdit, setUnitToEdit] = useState<any | null>(null);

    const fetchLatestData = async () => {
        const [latestUnits, latestFranchises] = await Promise.all([
            getUnitsWithCounts(),
            getFranchises()
        ]);
        setUnits(latestUnits);
        setFranchises(latestFranchises);
        return latestUnits;
    }

    useEffect(() => {
        const init = async () => {
            const data = await fetchLatestData();

            // Onload health check
            /* data.forEach(async (unit) => {
                if (unit.api_base_url && !unit.archived) {
                    const isHealthy = await checkUnitHealth(unit.api_base_url);
                    const newStatus: UnitStatus = isHealthy ? "enabled" : "not connected";

                    if (unit.status !== newStatus) {
                        try {
                            await updateUnitStatus(unit.id, newStatus);
                        } catch (error) {
                            console.error(`Status update failed for unit ${unit.unit_name}`);
                        }
                    }
                }
            }); */
        };

        init();

        const channel = supabase
            .channel('realtime_units')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, () => {
                fetchLatestData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'funder_account' }, () => {
                fetchLatestData();
            })
            .subscribe();

        const supabase2 = createClient2();
        const botChannel = supabase2
            .channel('bot_monitoring_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bot_monitoring' }, () => {
                fetchLatestData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(botChannel);
        };
    }, []);

    const handleStatusChange = async (unitId: string, newStatus: UnitStatus) => {
        try {
            await updateBaccaratRow({
                id: unitId,
                status: newStatus,
                level: null,
                pattern: null,
                target_profit: null
            });
        } catch (error: any) {
            console.error("Error updating unit status:", error);
            toast.error("Failed to update status");
        }
    }

    const handleArchiveClick = (id: string, name: string) => {
        setSelectedUnitForArchive({ id, name });
        setIsArchiveModalOpen(true);
    }

    const handleArchiveConfirm = async () => {
        if (!selectedUnitForArchive) return;

        setIsArchiving(true);
        try {
            await archiveUnit(selectedUnitForArchive.id);
            toast.success(`${selectedUnitForArchive.name} archived successfully`);
            setIsArchiveModalOpen(false);
            setSelectedUnitForArchive(null);
        } catch (error: any) {
            console.error("Error archiving unit:", error);
            toast.error("Failed to archive unit");
        } finally {
            setIsArchiving(false);
        }
    }

    const handleEditClick = (id: string) => {
        const unit = units.find(u => u.id === id);
        if (unit) {
            setUnitToEdit(unit);
            setIsUnitModalOpen(true);
        }
    }

    const handleAddClick = () => {
        setUnitToEdit(null);
        setIsUnitModalOpen(true);
    }

    const filteredUnits = units.filter(unit => {
        const matchesSearch = unit.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.franchise_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.franchise_code?.toLowerCase().includes(searchQuery.toLowerCase());
        return !unit.archived && matchesSearch;
    });

    React.useImperativeHandle(ref, () => ({
        handleAddClick
    }));

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {filteredUnits.map((unit) => {
                    const styles = getFranchiseStyles(unit.franchise_code);
                    return (
                        <UnitCard
                            key={unit.id}
                            id={unit.id}
                            code={unit.pc_name || unit.unit_name}
                            shortName={unit.franchise_code || "UN"}
                            franchiseCode={unit.franchise_code || undefined}
                            company={
                                unit.assigned_user
                                    ? `${unit.assigned_user.first_name || ""} ${unit.assigned_user.middle_name || ""} ${unit.assigned_user.last_name || ""}`.replace(/\s+/g, " ").trim()
                                    : (unit.franchise?.franchise_name || undefined)
                            }
                            status={unit.status || "Disabled"}
                            serial={unit.unit_id?.split("-")[0]?.toUpperCase() || "N/A"}
                            owner={
                                unit.assigned_user 
                                    ? `${unit.assigned_user.first_name || ""} ${unit.assigned_user.middle_name || ""} ${unit.assigned_user.last_name || ""}`.replace(/\s+/g, " ").trim()
                                    : (unit.franchise?.franchise_name || "System")
                            }
                            assignedUserName={
                                unit.assigned_user 
                                    ? `${unit.assigned_user.first_name || ""} ${unit.assigned_user.middle_name || ""} ${unit.assigned_user.last_name || ""}`.replace(/\s+/g, " ").trim()
                                    : undefined
                            }
                            {...styles}
                            onStatusChange={handleStatusChange}
                            onArchive={handleArchiveClick}
                            onEdit={handleEditClick}
                            tags={unit.funder_counts?.map((fc: any) => ({
                                label: fc.allias,
                                count: fc.count,
                                bgColor: fc.allias_color,
                                textColor: fc.text_color
                            })) || []}
                        />
                    );
                })}
            </div>

            <ArchiveUnitModal
                isOpen={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
                onConfirm={handleArchiveConfirm}
                unitName={selectedUnitForArchive?.name || ""}
                isPending={isArchiving}
            />

            <UnitModal
                isOpen={isUnitModalOpen}
                onClose={() => setIsUnitModalOpen(false)}
                initialData={unitToEdit}
                onSuccess={fetchLatestData}
            />
        </div>
    );
});

UnitsRealtime.displayName = "UnitsRealtime";
