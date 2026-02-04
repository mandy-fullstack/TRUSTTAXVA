import { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    TextInput,
    Platform,
} from "react-native";
import { H3, Text, Button } from "@trusttax/ui";
import { X, Search, User, FileText } from "lucide-react";
import { api } from "../../services/api";

interface CreateOrderModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (order: any) => void;
}

export function CreateOrderModal({ visible, onClose, onSuccess }: CreateOrderModalProps) {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [services, setServices] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [userSearch, setUserSearch] = useState("");
    const [serviceSearch, setServiceSearch] = useState("");

    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    const loadData = async () => {
        try {
            setInitialLoading(true);
            const [servicesData, usersData] = await Promise.all([
                api.getServices(),
                api.getClients(),
            ]);
            setServices(servicesData);
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to load data for CreateOrderModal:", error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!selectedUser || !selectedService) return;

        try {
            setLoading(true);
            const order = await api.createOrder({
                userId: selectedUser.id,
                serviceId: selectedService.id,
                status: "SUBMITTED",
            });
            onSuccess(order);
            onClose();
            // Reset state
            setSelectedUser(null);
            setSelectedService(null);
            setUserSearch("");
            setServiceSearch("");
        } catch (error) {
            console.error("Failed to create order:", error);
            alert("Failed to create order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        const search = userSearch.toLowerCase();
        return (
            u.email.toLowerCase().includes(search) ||
            (u.name || "").toLowerCase().includes(search) ||
            (u.firstName || "").toLowerCase().includes(search) ||
            (u.lastName || "").toLowerCase().includes(search)
        );
    });

    const filteredServices = services.filter((s) => {
        const search = serviceSearch.toLowerCase();
        return (
            s.name.toLowerCase().includes(search) ||
            s.category.toLowerCase().includes(search)
        );
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <H3>Nueva Orden</H3>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <X size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {initialLoading ? (
                        <View style={styles.centerLoading}>
                            <ActivityIndicator size="large" color="#0F172A" />
                            <Text style={styles.loadingText}>Cargando datos...</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                            {/* Client Selection */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>1. Seleccionar Cliente</Text>
                                {selectedUser ? (
                                    <View style={styles.selectedItem}>
                                        <View style={styles.itemInfo}>
                                            <User size={20} color="#0F172A" />
                                            <View style={styles.itemTextContent}>
                                                <Text style={styles.itemMainText}>{selectedUser.name || selectedUser.firstName || "Sin nombre"}</Text>
                                                <Text style={styles.itemSubText}>{selectedUser.email}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => setSelectedUser(null)}>
                                            <Text style={styles.changeText}>Cambiar</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View>
                                        <View style={styles.searchContainer}>
                                            <Search size={18} color="#94A3B8" style={styles.searchIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Buscar por nombre o email..."
                                                value={userSearch}
                                                onChangeText={setUserSearch}
                                            />
                                        </View>
                                        <View style={styles.listContainer}>
                                            {filteredUsers.slice(0, 5).map((user) => (
                                                <TouchableOpacity
                                                    key={user.id}
                                                    style={styles.listItem}
                                                    onPress={() => setSelectedUser(user)}
                                                >
                                                    <User size={16} color="#64748B" />
                                                    <View style={styles.listItemText}>
                                                        <Text style={styles.listItemName}>{user.name || user.firstName || "Sin nombre"}</Text>
                                                        <Text style={styles.listItemEmail}>{user.email}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <Text style={styles.emptyText}>No se encontraron usuarios</Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Service Selection */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>2. Seleccionar Servicio</Text>
                                {selectedService ? (
                                    <View style={styles.selectedItem}>
                                        <View style={styles.itemInfo}>
                                            <FileText size={20} color="#0F172A" />
                                            <View style={styles.itemTextContent}>
                                                <Text style={styles.itemMainText}>{selectedService.name}</Text>
                                                <Text style={styles.itemSubText}>{selectedService.category} · ${selectedService.price}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => setSelectedService(null)}>
                                            <Text style={styles.changeText}>Cambiar</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View>
                                        <View style={styles.searchContainer}>
                                            <Search size={18} color="#94A3B8" style={styles.searchIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Buscar servicio..."
                                                value={serviceSearch}
                                                onChangeText={setServiceSearch}
                                            />
                                        </View>
                                        <View style={styles.listContainer}>
                                            {filteredServices.map((service) => (
                                                <TouchableOpacity
                                                    key={service.id}
                                                    style={styles.listItem}
                                                    onPress={() => setSelectedService(service)}
                                                >
                                                    <FileText size={16} color="#64748B" />
                                                    <View style={styles.listItemText}>
                                                        <Text style={styles.listItemName}>{service.name}</Text>
                                                        <Text style={styles.listItemEmail}>{service.category} · ${service.price}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    )}

                    <View style={styles.footer}>
                        <Button
                            title="Cancelar"
                            onPress={onClose}
                            variant="outline"
                            disabled={loading}
                            style={styles.footerButton}
                        />
                        <Button
                            title={loading ? "Creando..." : "Crear Orden"}
                            onPress={handleCreate}
                            disabled={loading || !selectedUser || !selectedService}
                            style={styles.footerButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#FFF",
        width: "100%",
        maxWidth: 500,
        maxHeight: "90%",
        borderRadius: 0, // Design requirement for professional look
        borderWidth: 1,
        borderColor: "#E2E8F0",
        ...Platform.select({
            web: {
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            },
            default: {
                elevation: 8,
            },
        }),
    },
    header: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    scroll: {
        padding: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#64748B",
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 0,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 14,
        color: "#1E293B",
    },
    listContainer: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        borderRadius: 0,
        backgroundColor: "#FFF",
        overflow: "hidden",
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        gap: 12,
    },
    listItemText: {
        flex: 1,
    },
    listItemName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E293B",
    },
    listItemEmail: {
        fontSize: 12,
        color: "#94A3B8",
    },
    selectedItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F0F9FF",
        borderWidth: 1,
        borderColor: "#BAE6FD",
        padding: 16,
        borderRadius: 0,
    },
    itemInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    itemTextContent: {
        flex: 1,
    },
    itemMainText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0F172A",
    },
    itemSubText: {
        fontSize: 13,
        color: "#0369A1",
    },
    changeText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0284C7",
    },
    emptyText: {
        padding: 16,
        textAlign: "center",
        color: "#94A3B8",
        fontSize: 14,
    },
    centerLoading: {
        padding: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 12,
        color: "#64748B",
        fontSize: 14,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    footerButton: {
        minWidth: 120,
    },
});
