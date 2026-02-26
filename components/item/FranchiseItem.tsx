import React from "react";
import { Franchise } from "@/types/franchise";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface FranchiseItemProps {
    franchise: Franchise;
    onEdit?: (franchise: Franchise) => void;
}

export const FranchiseItem = ({ franchise, onEdit }: FranchiseItemProps) => {
    return (
        <Card className="bg-[#111111] border-gray-800 hover:border-gray-700 transition-all group">
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <h3 className="text-white font-medium">{franchise.franchise_name}</h3>
                        <p className="text-sm text-gray-400">{franchise.investor_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400/20 bg-blue-400/10">
                            {franchise.franchise_code}
                        </Badge>
                        {onEdit && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                onClick={() => onEdit(franchise)}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
